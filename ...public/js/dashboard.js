import { api } from './api.js';

/* Guardia de sesión */
const userRaw = sessionStorage.getItem('user') || localStorage.getItem('user');
if (!userRaw) {
    window.location.href = './login.html';
}

const userData = JSON.parse(userRaw);
document.getElementById('userName').textContent  = userData.nombre || userData.email;
document.getElementById('userEmail').textContent = userData.email;

/* Referencias DOM */
const tbody       = document.getElementById('usuariosTable');
const tablaFooter = document.getElementById('tablaFooter');
const filtro      = document.getElementById('filtro');
const nuevoBtn    = document.getElementById('nuevoBtn');
const refreshBtn  = document.getElementById('refreshBtn');
const logoutBtn   = document.getElementById('logoutBtn');

const modalEl     = document.getElementById('modalUsuario');
const modal       = new bootstrap.Modal(modalEl);
const modalTitulo = document.getElementById('modalTitulo');
const formUsuario = document.getElementById('formUsuario');
const modalFeed   = document.getElementById('modalFeedback');

const inputs = {
    id:           document.getElementById('formId'),
    nombre:       document.getElementById('formNombre'),
    edad:         document.getElementById('formEdad'),
    ocupacion:    document.getElementById('formOcupacion'),
    ciudad_natal: document.getElementById('formCiudadNatal'),
    direccion:    document.getElementById('formDireccion'),
    email:        document.getElementById('formEmail'),
    pass:         document.getElementById('formPass')
};

let usuarios = [];

/* Cargar */
async function cargarUsuarios() {
    tablaFooter.textContent = 'Cargando...';
    try {
        const { ok, data } = await api.listar();
        if (!ok) throw new Error(data.error || 'Error al cargar');
        usuarios = data;
        renderTabla();
        renderKPIs();
    } catch (error) {
        console.error('❌', error);
        tablaFooter.textContent = 'Error al cargar usuarios.';
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
}

/* Tabla */
function renderTabla() {
    const term = filtro.value.trim().toLowerCase();
    const lista = usuarios.filter(u =>
        !term ||
        (u.nombre        || '').toLowerCase().includes(term) ||
        (u.email         || '').toLowerCase().includes(term) ||
        (u.ciudad_natal  || '').toLowerCase().includes(term) ||
        (u.ocupacion     || '').toLowerCase().includes(term)
    );

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="7" class="text-center text-muted py-4">
                <i class="fas fa-inbox fa-2x d-block mb-2"></i>
                No hay usuarios para mostrar
            </td></tr>`;
    } else {
        tbody.innerHTML = lista.map(u => `
            <tr>
                <td><span class="badge bg-light text-dark">#${u.id}</span></td>
                <td class="fw-semibold">${escapeHtml(u.nombre)}</td>
                <td class="d-none d-md-table-cell">${u.edad}</td>
                <td class="d-none d-lg-table-cell">${escapeHtml(u.ocupacion)}</td>
                <td class="d-none d-lg-table-cell">${escapeHtml(u.ciudad_natal)}</td>
                <td class="text-muted small">${escapeHtml(u.email)}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1"
                            data-accion="editar" data-id="${u.id}">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger"
                            data-accion="eliminar" data-id="${u.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`).join('');
    }

    tablaFooter.textContent = `${lista.length} de ${usuarios.length} usuarios`;
}

/* KPIs */
function renderKPIs() {
    document.getElementById('totalUsuarios').textContent = usuarios.length;

    const prom = usuarios.length
        ? Math.round(usuarios.reduce((a, u) => a + Number(u.edad || 0), 0) / usuarios.length)
        : 0;
    document.getElementById('edadPromedio').textContent     = prom;
    document.getElementById('totalOcupaciones').textContent = new Set(usuarios.map(u => u.ocupacion)).size;
    document.getElementById('totalCiudades').textContent    = new Set(usuarios.map(u => u.ciudad_natal)).size;
}

/* Acciones */
tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-accion]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.accion === 'editar')   abrirModalEditar(id);
    if (btn.dataset.accion === 'eliminar') eliminarUsuario(id);
});

/* Modal */
function abrirModalCrear() {
    modalTitulo.textContent = 'Nuevo usuario';
    formUsuario.reset();
    inputs.id.value = '';
    inputs.pass.required = true;
    modalFeed.innerHTML = '';
    modal.show();
}

function abrirModalEditar(id) {
    const u = usuarios.find(x => x.id === id);
    if (!u) return;
    modalTitulo.textContent   = `Editar usuario #${u.id}`;
    inputs.id.value           = u.id;
    inputs.nombre.value       = u.nombre;
    inputs.edad.value         = u.edad;
    inputs.ocupacion.value    = u.ocupacion;
    inputs.ciudad_natal.value = u.ciudad_natal;
    inputs.direccion.value    = u.direccion;
    inputs.email.value        = u.email;
    inputs.pass.value         = '';
    inputs.pass.required      = false;
    modalFeed.innerHTML = '';
    modal.show();
}

/* Submit */
formUsuario.addEventListener('submit', async (e) => {
    e.preventDefault();
    modalFeed.innerHTML = '';

    const id = inputs.id.value;
    const datos = {
        nombre:       inputs.nombre.value.trim(),
        edad:         Number(inputs.edad.value),
        ocupacion:    inputs.ocupacion.value.trim(),
        ciudad_natal: inputs.ciudad_natal.value.trim(),
        direccion:    inputs.direccion.value.trim(),
        email:        inputs.email.value.trim()
    };
    const pass = inputs.pass.value.trim();
    if (pass) datos.pass = pass;

    const btnGuardar = document.getElementById('btnGuardar');
    btnGuardar.disabled = true;

    try {
        const { ok, data } = id
            ? await api.actualizar(Number(id), datos)
            : await api.crear(datos);

        if (!ok) {
            modalFeed.innerHTML = `
                <div class="alert alert-danger py-2 mb-0 small">
                    <i class="fas fa-triangle-exclamation me-1"></i>
                    ${data.error || 'Error al guardar'}
                </div>`;
            return;
        }

        modal.hide();
        await cargarUsuarios();
        Swal.fire({
            icon: 'success',
            title: id ? 'Usuario actualizado' : 'Usuario creado',
            timer: 1400,
            showConfirmButton: false
        });
    } catch (error) {
        modalFeed.innerHTML = `<div class="alert alert-danger py-2 mb-0 small">${error.message}</div>`;
    } finally {
        btnGuardar.disabled = false;
    }
});

/* Eliminar */
async function eliminarUsuario(id) {
    const u = usuarios.find(x => x.id === id);
    if (!u) return;

    const confirm = await Swal.fire({
        title: '¿Eliminar usuario?',
        text: `${u.nombre} (${u.email})`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;

    try {
        const { ok, data } = await api.eliminar(id);
        if (!ok) throw new Error(data.error || 'Error al eliminar');
        await cargarUsuarios();
        Swal.fire({ icon: 'success', title: 'Usuario eliminado', timer: 1400, showConfirmButton: false });
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
}

/* Filtro y botones */
filtro.addEventListener('input', renderTabla);
nuevoBtn.addEventListener('click', abrirModalCrear);
refreshBtn.addEventListener('click', cargarUsuarios);

logoutBtn.addEventListener('click', async () => {
    const r = await Swal.fire({
        title: '¿Cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#667eea',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
    });
    if (r.isConfirmed) {
        sessionStorage.removeItem('user');
        localStorage.removeItem('user');
        window.location.href = './login.html';
    }
});

/* Helper */
function escapeHtml(str = '') {
    return String(str)
        .replaceAll('&',  '&amp;')
        .replaceAll('<',  '&lt;')
        .replaceAll('>',  '&gt;')
        .replaceAll('"',  '&quot;')
        .replaceAll("'",  '&#039;');
}

/* Arranque */
cargarUsuarios();