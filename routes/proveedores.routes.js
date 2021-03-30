const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const {
    getProveedor,
    listarProveedores,
    nuevoProveedor,
    actualizarProveedor
 } = require('../controllers/proveedores.controllers');

const router = Router();

router.get('/:id', validarJWT, getProveedor);
router.get('/', validarJWT, listarProveedores);
router.post('/', [
    validarJWT,
    check('razon_social', 'Razon social es un campo obligatorio').not().isEmpty(),
    check('cuit', 'Cuit es un campo obligatorio').not().isEmpty(),
    check('condicion_iva', 'La condicion frente al IVA es un campo obligatorio').not().isEmpty(),
    validarCampos  
], nuevoProveedor);
router.put('/:id', validarJWT ,actualizarProveedor);

module.exports = router;