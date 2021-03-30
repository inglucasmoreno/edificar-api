const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const {
    getIngreso,
    nuevoIngreso, 
    listarIngresos,
    actualizarIngreso,
 } = require('../controllers/ingreso.controllers');

const router = Router();

router.get('/:id', validarJWT, getIngreso);
router.get('/', validarJWT, listarIngresos);
router.post('/',
[   
    validarJWT,
    check('numero_remito', 'El numero de remito es obligatorio').not().isEmpty(),
    check('proveedor', 'El proveedor es obligatorio').not().isEmpty(),
    validarCampos
], nuevoIngreso);
router.put('/:id', validarJWT, actualizarIngreso);

module.exports = router;