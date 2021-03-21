const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const {
    nuevoIngreso, listarIngresos
 } = require('../controllers/ingreso_productos.controllers');

const router = Router();

router.get('/',listarIngresos);
router.post('/',
[
    check('numero_remito', 'El numero de remito es obligatorio').not().isEmpty(),
    check('cuit_proveedor', 'El CUIT del proveedor es obligatorio').not().isEmpty(),
    check('razon_social_proveedor', 'La razon social del proveedor es obligatorio').not().isEmpty(),
    validarCampos
], nuevoIngreso);

module.exports = router;