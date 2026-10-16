/* ============================================================
   AREA DE IMPORTACION
   ============================================================ */
import express from 'express';
import cors from 'cors';      ///importo cors despues de installarlo como dependencia
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import logger from './middlewares/logger.middleware.js';
import usuariosRoutes from './routes/usuarios.routes.js';
/////// ya NO importo fileURLToPath ni path porque ya no sirvo archivos estaticos

/* ============================================================
   CONFIGURACION
   ============================================================ */
dotenv.config();
const puertoENV = process.env.PORT || 3000;   ///// .env dice PORT=3000, este es el fallback
const now = dayjs();

///// ya NO calculo __filename ni __dirname porque ya no sirvo la carpeta public

/* ============================================================
   SERVIDOR + MIDDLEWARES
   ============================================================ */
const app = express();

///// CORS ABIERTO: en multi repo el front vive en otro puerto (5500, 5173, etc.)
///// y el navegador SIEMPRE va a bloquear la peticion por "origen distinto"
///// hasta que el backend diga "te dejo pasar". Con cors() sin argumentos,
///// aceptamos peticiones de CUALQUIER origen.
app.use(cors());

app.use(express.json());
app.use(logger);

///// ❌ BORRADO: app.use(express.static(path.join(__dirname, 'public')))
/////    El front ya no lo sirve Express, vive en su propio repo / puerto.

/* ============================================================
   RUTAS
   ============================================================ */
///// ❌ BORRADO: app.get('/', (req, res) => res.redirect('/login.html'))
/////    Ya no hay login.html acá para redirigir.

///// ✅ NUEVO: ruta raiz que devuelve info de la API (util para verificar
/////    desde el navegador que el backend esta vivo, sin Postman).
app.get('/', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'API Usuarios activa',
    endpoints: [
      'POST   /usuarios/login',
      'GET    /usuarios',
      'GET    /usuarios/:id',
      'POST   /usuarios',
      'PUT    /usuarios/:id',
      'DELETE /usuarios/:id'
    ]
  });
});

app.use('/usuarios', usuariosRoutes);

/* ============================================================
   INICIO
   ============================================================ */
app.listen(puertoENV, () => {
  console.log(`👌*********************************************`);
  console.log(`✅ Backend corriendo en http://localhost:${puertoENV}`);
  console.log(`📡 API:   http://localhost:${puertoENV}/usuarios`);
  console.log(`🌐 Front: en OTRO puerto (Live Server 5500, etc.)`);
  console.log(`🔓 CORS:  abierto a cualquier origen`);
  console.log(`❌**************Ctrl+C para salir**************`);
  console.log(`***********************************************`);
  console.log(`**📅 last update: ${now.format('dddd YYYY-MM-DD HH:mm:ss')}**`);
});