import { Router } from 'express';
import {
  login,
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../controllers/usuarios.controller.js';

const router = Router();

/* Autenticación */
router.post('/login', login);

/* CRUD */
router.get('/',        listarUsuarios);
router.get('/:id',     obtenerUsuario);
router.post('/',       crearUsuario);
router.put('/:id',     actualizarUsuario);
router.delete('/:id',  eliminarUsuario);

export default router;