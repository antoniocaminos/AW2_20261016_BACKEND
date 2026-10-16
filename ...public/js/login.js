import { api } from './api.js';

document.addEventListener('DOMContentLoaded', () => {

    const loginForm     = document.getElementById('loginForm');
    const emailInput    = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn      = document.getElementById('loginBtn');
    const btnText       = document.getElementById('btnText');
    const btnSpinner    = document.getElementById('btnSpinner');

    /* Si ya hay sesión, ir al dashboard */
    if (sessionStorage.getItem('user') || localStorage.getItem('user')) {
        window.location.href = './dashboard.html';
        return;
    }

    function showLoading() {
        btnText.classList.add('d-none');
        btnSpinner.classList.remove('d-none');
        loginBtn.disabled = true;
    }
    function hideLoading() {
        btnText.classList.remove('d-none');
        btnSpinner.classList.add('d-none');
        loginBtn.disabled = false;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    function clearValidation() {
        emailInput.classList.remove('is-invalid');
        passwordInput.classList.remove('is-invalid');
    }
    function validateForm() {
        let isValid = true;
        clearValidation();
        if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
            emailInput.classList.add('is-invalid');
            isValid = false;
        }
        if (!passwordInput.value.trim()) {
            passwordInput.classList.add('is-invalid');
            isValid = false;
        }
        return isValid;
    }

    /* Credenciales de prueba */
    document.querySelectorAll('.credential-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            emailInput.value    = card.dataset.email;
            passwordInput.value = card.dataset.pass;
            passwordInput.focus();
        });
    });

    /* Submit */
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, completa todos los campos correctamente.',
                confirmButtonColor: '#667eea'
            });
            return;
        }

        showLoading();

        const email = emailInput.value.trim();
        const pass  = passwordInput.value.trim();

        try {
            const { ok, status, data } = await api.login(email, pass);

            if (ok) {
                const nombre = extraerNombre(data.mensaje) || email;

                await Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido!',
                    text: data.mensaje || 'Login exitoso',
                    confirmButtonColor: '#667eea',
                    timer: 1800,
                    timerProgressBar: true,
                    showConfirmButton: false
                });

                sessionStorage.setItem('user', JSON.stringify({ email, nombre }));
                window.location.href = './dashboard.html';

            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Credenciales inválidas',
                    text: data.error || `Error ${status}`,
                    confirmButtonColor: '#667eea'
                });
                passwordInput.value = '';
                passwordInput.focus();
            }

        } catch (error) {
            console.error('❌ Error:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: error.message,
                confirmButtonColor: '#667eea'
            });
        } finally {
            hideLoading();
        }
    });

    emailInput.addEventListener('input',    () => emailInput.classList.remove('is-invalid'));
    passwordInput.addEventListener('input', () => passwordInput.classList.remove('is-invalid'));

    function extraerNombre(mensaje = '') {
        const match = mensaje.match(/bienvenido\s+(.+?)[!.]?$/i);
        return match ? match[1].trim() : null;
    }
});