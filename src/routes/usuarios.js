import express from 'express';
import { getuser, getuserid, addUser, loginUser, addPreferencias, getPreferencias ,deleteUser,updateUser} from '../controladores/usuariosctrl.js';

const router = express.Router();

router.get('/usuarios', getuser);
router.get('/usuarios/:id', getuserid);
router.post('/usuarios', addUser);
router.post('/login', loginUser);  // Ruta para login de usuarios
router.post('/usuarios/:id/preferencias', addPreferencias);
router.get('/usuarios/:id/preferencias', getPreferencias);
router.delete('/usuarios/:id', deleteUser);
router.put('/usuarios/:id', updateUser);


export default router;
