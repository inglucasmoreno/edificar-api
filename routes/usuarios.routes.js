const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');

const {
    getUsuario,
    listarUsuarios,
    nuevoUsuario,
    actualizarUsuario 
    } = require('../controllers/usuarios.controllers');

const router = Router();

router.get('/:id', validarJWT, getUsuario);
router.get('/', validarJWT, listarUsuarios);
router.post('/',
            [
                validarJWT,
                check('dni', 'El DNI es obligatorio').not().isEmpty(),
                check('apellido', 'El Apellido es obligatorio').not().isEmpty(),
                check('nombre', 'El Nombre es obligatorio').not().isEmpty(),
                check('password', 'El Password es obligatorio').not().isEmpty(),
                check('email', 'El Email es obligatorio').not().isEmpty(),
                validarCampos
            ]
            , nuevoUsuario);
router.put('/:id', validarJWT, actualizarUsuario);

module.exports = router;