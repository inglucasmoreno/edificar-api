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
    check('punto_venta', 'El punto de venta es obligatorio').not().isEmpty(),
    check('nro_comprobante', 'El numero de comprobante es obligatorio').not().isEmpty(),
    check('proveedor', 'El proveedor es obligatorio').not().isEmpty(),
    validarCampos
], nuevoIngreso);
router.put('/:id', validarJWT, actualizarIngreso);

module.exports = router;