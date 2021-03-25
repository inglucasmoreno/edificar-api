const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const {
    getIngreso,
    nuevoIngreso, 
    listarIngresos,
    actualizarIngreso,
 } = require('../controllers/ingreso_productos.controllers');

const router = Router();

router.get('/:id', validarJWT, getIngreso);
router.get('/', validarJWT, listarIngresos);
router.post('/',
[   
    validarJWT,
    check('numero_remito', 'El numero de remito es obligatorio').not().isEmpty(),
    check('cuit_proveedor', 'El CUIT del proveedor es obligatorio').not().isEmpty(),
    check('razon_social_proveedor', 'La razon social del proveedor es obligatorio').not().isEmpty(),
    validarCampos
], nuevoIngreso);
router.put('/:id', validarJWT, actualizarIngreso);

module.exports = router;