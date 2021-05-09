const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const {
    nuevoRemitoEntrega, 
    listarRemitosPorEgreso,
    entregaParcial
} = require('../controllers/remitos_egreso.controllers');

const router = Router();

router.get('/:id', validarJWT, listarRemitosPorEgreso);
router.post('/', [
    validarJWT,
    check('dato_1', 'El dato_1 es obligatorio').not().isEmpty(),
    check('dato_2', 'El dato_2 es obligatorio').not().isEmpty(),
    check('egreso', 'El egreso es obligatorio').not().isEmpty(),
    validarCampos  
], nuevoRemitoEntrega);
router.post('/parcial',[
    validarJWT,
    check('dato_1', 'El dato_1 es obligatorio').not().isEmpty(),
    check('dato_2', 'El dato_2 es obligatorio').not().isEmpty(),
    check('egreso', 'El egreso es obligatorio').not().isEmpty(),
    check('producto', 'Los productos son obligatorios').not().isEmpty(),
], entregaParcial)

module.exports = router;