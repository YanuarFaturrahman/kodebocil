FROM rust:1-slim-bookworm AS build
WORKDIR /app
COPY Cargo.toml Cargo.loc[k] ./
COPY src ./src
COPY migrations ./migrations
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/target/release/kodebocil /usr/local/bin/kodebocil
ENV PORT=8080
EXPOSE 8080
CMD ["kodebocil"]
