const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const { 
    nuevoProducto, 
    listarPorIngreso, 
    completarIngreso,
    eliminarProducto,
    ingresoParcial
} = require('../controllers/ingreso_productos.controllers');

const router = Router();

router.get('/:id', validarJWT, listarPorIngreso);
router.post('/', [
    validarJWT,
    check('ingreso', 'El Ingreso es obligatorio').not().isEmpty(),
    check('producto', 'El Producto es obligatorio').not().isEmpty(),
    check('cantidad', 'La cantidad es obligatorio').not().isEmpty(),
    validarCampos
], nuevoProducto);
router.put('/parcial/:id', [
    validarJWT,
    check('documento_codigo', 'El codigo de documento es obligatorio').not().isEmpty(),
    check('persona_empresa', 'La persona_empresa es obligatoria').not().isEmpty(),
    validarCampos
], ingresoParcial);
router.put('/completar/:id', [
    validarJWT,
    check('documento_codigo', 'El codigo de documento es obligatorio').not().isEmpty(),
    check('persona_empresa', 'La persona_empresa es obligatoria').not().isEmpty(),
    validarCampos
] , completarIngreso);
router.delete('/:id', validarJWT, eliminarProducto);

module.exports = router;