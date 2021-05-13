const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const {
    nuevoRemitoEntrega, 
    listarRemitosPorEgreso,
    entregaParcial,
    getRemitoEntrega,
    listarProductosRemito
} = require('../controllers/remitos_egreso.controllers');

const router = Router();

router.get('/:id', validarJWT, listarRemitosPorEgreso);
router.get('/getRemito/:id', validarJWT, getRemitoEntrega);
router.get('/getProductos/:id', validarJWT, listarProductosRemito);
router.post('/', [
    validarJWT,
    check('punto_venta', 'El punto de venta es obligatorio').not().isEmpty(),
    check('nro_comprobante', 'El numero de comprobante es obligatorio').not().isEmpty(),
    check('egreso', 'El egreso es obligatorio').not().isEmpty(),
    validarCampos  
], nuevoRemitoEntrega);
router.post('/parcial',[
    validarJWT,
    check('punto_venta', 'El punto de venta es obligatorio').not().isEmpty(),
    check('nro_comprobante', 'El numero de comprobante es obligatorio').not().isEmpty(),
    check('egreso', 'El egreso es obligatorio').not().isEmpty(),
    check('producto', 'Los productos son obligatorios').not().isEmpty(),
], entregaParcial)

module.exports = router;