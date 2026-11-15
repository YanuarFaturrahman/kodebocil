use argon2::{password_hash::{rand_core::OsRng, SaltString}, Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use axum::{async_trait, extract::{FromRequestParts, Path, State}, http::{request::Parts, StatusCode}, routing::{delete, get, post}, Json, Router};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::{postgres::PgPoolOptions, PgPool};
use std::time::{SystemTime, UNIX_EPOCH};
use tower_http::cors::CorsLayer;

#[derive(Clone)]
struct AppState { db: PgPool, secret: String }
#[derive(Serialize, Deserialize)]
struct Claims { sub: i32, role: String, exp: usize }
struct Auth(Claims);
type R = Result<Json<Value>, StatusCode>;
fn ie<E>(_: E) -> StatusCode { StatusCode::INTERNAL_SERVER_ERROR }

#[async_trait]
impl FromRequestParts<AppState> for Auth {
    type Rejection = StatusCode;
    async fn from_request_parts(p: &mut Parts, s: &AppState) -> Result<Self, StatusCode> {
        let t = p.headers.get("authorization").and_then(|v| v.to_str().ok())
            .and_then(|v| v.strip_prefix("Bearer ")).ok_or(StatusCode::UNAUTHORIZED)?;
        decode::<Claims>(t, &DecodingKey::from_secret(s.secret.as_bytes()), &Validation::default())
            .map(|d| Auth(d.claims)).map_err(|_| StatusCode::UNAUTHORIZED)
    }
}
fn need(a: &Auth, role: &str) -> Result<(), StatusCode> { if a.0.role == role { Ok(()) } else { Err(StatusCode::FORBIDDEN) } }
fn hash(pw: &str) -> Result<String, StatusCode> {
    Argon2::default().hash_password(pw.as_bytes(), &SaltString::generate(&mut OsRng)).map(|h| h.to_string()).map_err(ie)
}
fn token(s: &AppState, id: i32, role: &str, name: &str) -> Value {
    let exp = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() as usize + 7 * 86400;
    let t = encode(&Header::default(), &Claims { sub: id, role: role.into(), exp }, &EncodingKey::from_secret(s.secret.as_bytes())).unwrap();
    json!({"token": t, "role": role, "name": name})
}

#[derive(Deserialize)] struct Login { username: String, password: String }
#[derive(Deserialize)] struct Reg { name: String, username: String, password: String, avatar: Option<String> }

async fn register(State(s): State<AppState>, Json(b): Json<Reg>) -> R {
    if b.password.len() < 6 { return Err(StatusCode::BAD_REQUEST); }
    let (id,): (i32,) = sqlx::query_as("INSERT INTO users(name,username,password_hash,role) VALUES($1,$2,$3,'parent') RETURNING id")
        .bind(&b.name).bind(&b.username).bind(hash(&b.password)?).fetch_one(&s.db).await.map_err(|_| StatusCode::CONFLICT)?;
    Ok(Json(token(&s, id, "parent", &b.name)))
}
async fn login(State(s): State<AppState>, Json(b): Json<Login>) -> R {
    let r: Option<(i32, String, String, String)> = sqlx::query_as("SELECT id,password_hash,role,name FROM users WHERE username=$1")
        .bind(&b.username).fetch_optional(&s.db).await.map_err(ie)?;
    let (id, h, role, name) = r.ok_or(StatusCode::UNAUTHORIZED)?;
    let ph = PasswordHash::new(&h).map_err(ie)?;
    Argon2::default().verify_password(b.password.as_bytes(), &ph).map_err(|_| StatusCode::UNAUTHORIZED)?;
    Ok(Json(token(&s, id, &role, &name)))
}
async fn me(a: Auth, State(s): State<AppState>) -> R {
    let (n, x, av): (String, i32, String) = sqlx::query_as("SELECT name,xp,avatar FROM users WHERE id=$1").bind(a.0.sub).fetch_one(&s.db).await.map_err(ie)?;
    Ok(Json(json!({"name": n, "xp": x, "avatar": av, "role": a.0.role})))
}
async fn lessons(a: Auth, State(s): State<AppState>) -> R {
    let rows: Vec<(i32, String, String, String, String, i32, Value, i32, Option<i32>, String)> = sqlx::query_as(
        "SELECT l.id,l.title,l.description,l.kind,COALESCE(c.name,'Lainnya'),l.xp_reward,l.content,COALESCE(p.stars,0),l.category_id,COALESCE(c.emoji,'🗺️') FROM lessons l LEFT JOIN categories c ON c.id=l.category_id LEFT JOIN progress p ON p.lesson_id=l.id AND p.user_id=$1 ORDER BY c.sort,c.id,l.id")
        .bind(a.0.sub).fetch_all(&s.db).await.map_err(ie)?;
    Ok(Json(rows.into_iter().map(|r| json!({"id": r.0, "title": r.1, "description": r.2, "kind": r.3, "world": r.4, "xp_reward": r.5, "content": r.6, "stars": r.7, "category_id": r.8, "emoji": r.9})).collect()))
}
#[derive(Deserialize)] struct Done { stars: i32 }
async fn complete(a: Auth, State(s): State<AppState>, Path(lid): Path<i32>, Json(b): Json<Done>) -> R {
    need(&a, "child")?;
    let stars = b.stars.clamp(1, 3);
    let (reward,): (i32,) = sqlx::query_as("SELECT xp_reward FROM lessons WHERE id=$1").bind(lid).fetch_one(&s.db).await.map_err(|_| StatusCode::NOT_FOUND)?;
    let old: Option<(i32,)> = sqlx::query_as("SELECT stars FROM progress WHERE user_id=$1 AND lesson_id=$2").bind(a.0.sub).bind(lid).fetch_optional(&s.db).await.map_err(ie)?;
    let gained = if old.is_none() { reward * stars / 3 + reward / 3 } else { 0 };
    sqlx::query("INSERT INTO progress(user_id,lesson_id,stars) VALUES($1,$2,$3) ON CONFLICT(user_id,lesson_id) DO UPDATE SET stars=GREATEST(progress.stars,$3)")
        .bind(a.0.sub).bind(lid).bind(stars).execute(&s.db).await.map_err(ie)?;
    let (xp,): (i32,) = sqlx::query_as("UPDATE users SET xp=xp+$2 WHERE id=$1 RETURNING xp").bind(a.0.sub).bind(gained).fetch_one(&s.db).await.map_err(ie)?;
    let nb: Vec<(String, String)> = sqlx::query_as(
        "INSERT INTO user_badges SELECT $1,id FROM badges WHERE xp_required<=$2 ON CONFLICT DO NOTHING RETURNING (SELECT name FROM badges WHERE id=badge_id),(SELECT emoji FROM badges WHERE id=badge_id)")
        .bind(a.0.sub).bind(xp).fetch_all(&s.db).await.map_err(ie)?;
    Ok(Json(json!({"gained": gained, "xp": xp, "new_badges": nb.into_iter().map(|b| json!({"name": b.0, "emoji": b.1})).collect::<Vec<_>>()})))
}
async fn badges(a: Auth, State(s): State<AppState>) -> R {
    let rows: Vec<(String, String, i32, bool)> = sqlx::query_as(
        "SELECT b.name,b.emoji,b.xp_required,(ub.user_id IS NOT NULL) FROM badges b LEFT JOIN user_badges ub ON ub.badge_id=b.id AND ub.user_id=$1 ORDER BY b.xp_required")
        .bind(a.0.sub).fetch_all(&s.db).await.map_err(ie)?;
    Ok(Json(rows.into_iter().map(|r| json!({"name": r.0, "emoji": r.1, "xp_required": r.2, "owned": r.3})).collect()))
}
async fn leaderboard(_a: Auth, State(s): State<AppState>) -> R {
    let rows: Vec<(String, String, i32)> = sqlx::query_as("SELECT name,avatar,xp FROM users WHERE role='child' ORDER BY xp DESC LIMIT 20").fetch_all(&s.db).await.map_err(ie)?;
    Ok(Json(rows.into_iter().map(|r| json!({"name": r.0, "avatar": r.1, "xp": r.2})).collect()))
}
async fn children(a: Auth, State(s): State<AppState>) -> R {
    need(&a, "parent")?;
    let rows: Vec<(i32, String, String, i32, i32, i32, String)> = sqlx::query_as(
        "SELECT u.id,u.name,u.avatar,u.xp,(SELECT COUNT(*) FROM progress WHERE user_id=u.id)::int,(SELECT COUNT(*) FROM lessons)::int,u.username FROM users u WHERE u.parent_id=$1 ORDER BY u.id")
        .bind(a.0.sub).fetch_all(&s.db).await.map_err(ie)?;
    Ok(Json(rows.into_iter().map(|r| json!({"id": r.0, "name": r.1, "avatar": r.2, "xp": r.3, "done": r.4, "total": r.5, "username": r.6})).collect()))
}
async fn add_child(a: Auth, State(s): State<AppState>, Json(b): Json<Reg>) -> R {
    need(&a, "parent")?;
    if b.password.len() < 4 { return Err(StatusCode::BAD_REQUEST); }
    sqlx::query("INSERT INTO users(name,username,password_hash,role,parent_id,avatar) VALUES($1,$2,$3,'child',$4,$5)")
        .bind(&b.name).bind(&b.username).bind(hash(&b.password)?).bind(a.0.sub).bind(b.avatar.unwrap_or("🐯".into()))
        .execute(&s.db).await.map_err(|_| StatusCode::CONFLICT)?;
    Ok(Json(json!({"ok": true})))
}
async fn stats(a: Auth, State(s): State<AppState>) -> R {
    need(&a, "admin")?;
    let (c, p, l, d): (i64, i64, i64, i64) = sqlx::query_as(
        "SELECT (SELECT COUNT(*) FROM users WHERE role='child'),(SELECT COUNT(*) FROM users WHERE role='parent'),(SELECT COUNT(*) FROM lessons),(SELECT COUNT(*) FROM progress)")
        .fetch_one(&s.db).await.map_err(ie)?;
    Ok(Json(json!({"children": c, "parents": p, "lessons": l, "completions": d})))
}
#[derive(Deserialize)] struct NewLesson { title: String, description: String, kind: String, category_id: Option<i32>, xp_reward: i32, content: Value }
async fn add_lesson(a: Auth, State(s): State<AppState>, Json(b): Json<NewLesson>) -> R {
    need(&a, "admin")?;
    sqlx::query("INSERT INTO lessons(title,description,kind,category_id,xp_reward,content) VALUES($1,$2,$3,$4,$5,$6)")
        .bind(b.title).bind(b.description).bind(b.kind).bind(b.category_id).bind(b.xp_reward).bind(b.content)
        .execute(&s.db).await.map_err(|_| StatusCode::BAD_REQUEST)?;
    Ok(Json(json!({"ok": true})))
}
async fn upd_lesson(a: Auth, State(s): State<AppState>, Path(id): Path<i32>, Json(b): Json<NewLesson>) -> R {
    need(&a, "admin")?;
    sqlx::query("UPDATE lessons SET title=$1,description=$2,kind=$3,category_id=$4,xp_reward=$5,content=$6 WHERE id=$7")
        .bind(b.title).bind(b.description).bind(b.kind).bind(b.category_id).bind(b.xp_reward).bind(b.content).bind(id)
        .execute(&s.db).await.map_err(|_| StatusCode::BAD_REQUEST)?;
    Ok(Json(json!({"ok": true})))
}
#[derive(Deserialize)] struct Cat { name: String, emoji: String }
async fn categories(_a: Auth, State(s): State<AppState>) -> R {
    let rows: Vec<(i32, String, String, i32)> = sqlx::query_as(
        "SELECT c.id,c.name,c.emoji,(SELECT COUNT(*) FROM lessons WHERE category_id=c.id)::int FROM categories c ORDER BY c.sort,c.id")
        .fetch_all(&s.db).await.map_err(ie)?;
    Ok(Json(rows.into_iter().map(|r| json!({"id": r.0, "name": r.1, "emoji": r.2, "games": r.3})).collect()))
}
async fn add_cat(a: Auth, State(s): State<AppState>, Json(b): Json<Cat>) -> R {
    need(&a, "admin")?;
    sqlx::query("INSERT INTO categories(name,emoji,sort) VALUES($1,$2,(SELECT COALESCE(MAX(sort),0)+1 FROM categories))")
        .bind(b.name).bind(b.emoji).execute(&s.db).await.map_err(|_| StatusCode::CONFLICT)?;
    Ok(Json(json!({"ok": true})))
}
async fn upd_cat(a: Auth, State(s): State<AppState>, Path(id): Path<i32>, Json(b): Json<Cat>) -> R {
    need(&a, "admin")?;
    sqlx::query("UPDATE categories SET name=$1,emoji=$2 WHERE id=$3").bind(b.name).bind(b.emoji).bind(id)
        .execute(&s.db).await.map_err(|_| StatusCode::CONFLICT)?;
    Ok(Json(json!({"ok": true})))
}
async fn del_cat(a: Auth, State(s): State<AppState>, Path(id): Path<i32>) -> R {
    need(&a, "admin")?;
    sqlx::query("DELETE FROM categories WHERE id=$1").bind(id).execute(&s.db).await.map_err(ie)?;
    Ok(Json(json!({"ok": true})))
}
async fn del_lesson(a: Auth, State(s): State<AppState>, Path(id): Path<i32>) -> R {
    need(&a, "admin")?;
    sqlx::query("DELETE FROM lessons WHERE id=$1").bind(id).execute(&s.db).await.map_err(ie)?;
    Ok(Json(json!({"ok": true})))
}

async fn health() -> &'static str { "ok" }

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let env = |k: &str, d: &str| std::env::var(k).unwrap_or(d.to_string());
    let db = PgPoolOptions::new().max_connections(8).connect(&env("DATABASE_URL", "postgres://kode:kode@localhost:5432/kodebocil")).await.expect("koneksi DB gagal");
    sqlx::migrate!("./migrations").run(&db).await.expect("migrasi gagal");
    let (au, ap) = (env("ADMIN_USER", "admin"), env("ADMIN_PASS", "admin123"));
    sqlx::query("INSERT INTO users(name,username,password_hash,role) VALUES('Admin',$1,$2,'admin') ON CONFLICT DO NOTHING")
        .bind(au).bind(hash(&ap).unwrap()).execute(&db).await.unwrap();
    let state = AppState { db, secret: env("JWT_SECRET", "dev-secret") };
    let app = Router::new()
        .route("/api/health", get(health)).route("/api/register", post(register)).route("/api/login", post(login)).route("/api/me", get(me))
        .route("/api/lessons", get(lessons)).route("/api/lessons/:id/complete", post(complete))
        .route("/api/badges", get(badges)).route("/api/leaderboard", get(leaderboard))
        .route("/api/children", get(children).post(add_child))
        .route("/api/admin/stats", get(stats)).route("/api/admin/lessons", post(add_lesson))
        .route("/api/admin/lessons/:id", delete(del_lesson).put(upd_lesson))
        .route("/api/categories", get(categories)).route("/api/admin/categories", post(add_cat))
        .route("/api/admin/categories/:id", delete(del_cat).put(upd_cat))
        .layer(CorsLayer::permissive()).with_state(state);
    let port = env("PORT", "8080");
    let l = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}")).await.unwrap();
    println!("API di port {port}");
    axum::serve(l, app).await.unwrap();
}
