/* ============================================================
   API_URL
   - Si la página se sirve desde el puerto del backend,
     usamos rutas relativas (mismo origen).
   - Si se sirve desde otro puerto (Live Server 5500, etc.),
     apuntamos explícitamente al backend.
   ============================================================ */
const BACKEND_PORT = 3000;

export const API_URL =
    location.port === String(BACKEND_PORT)
        ? '/usuarios'
        : `http://localhost:${BACKEND_PORT}/usuarios`;

console.log('🔌 API_URL =', API_URL);

/* ============================================================
   Wrapper fetch
   ============================================================ */
async function request(method, url, body) {
    const opciones = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept':       'application/json'
        }
    };
    if (body !== undefined) opciones.body = JSON.stringify(body);

    const res  = await fetch(url, opciones);
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
}

/* ============================================================
   Endpoints
   ============================================================ */
export const api = {
    login:      (email, pass) => request('POST',   `${API_URL}/login`, { email, pass }),
    listar:     ()            => request('GET',    `${API_URL}`),
    obtener:    (id)          => request('GET',    `${API_URL}/${id}`),
    crear:      (u)           => request('POST',   `${API_URL}`, u),
    actualizar: (id, datos)   => request('PUT',    `${API_URL}/${id}`, datos),
    eliminar:   (id)          => request('DELETE', `${API_URL}/${id}`)
};