export const getUser = () => JSON.parse(localStorage.getItem('kb_user') || 'null')
export const api = (path, body, method) => {
  const u = getUser()
  return fetch((import.meta.env.VITE_API_URL || '') + '/api' + path, {
    method: method || (body ? 'POST' : 'GET'),
    headers: { 'Content-Type': 'application/json', ...(u && { Authorization: 'Bearer ' + u.token }) },
    body: body && JSON.stringify(body),
  }).then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
}
