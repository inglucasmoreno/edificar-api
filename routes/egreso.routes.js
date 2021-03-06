const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const {
    getEgreso,
    nuevoEgreso, 
    listarEgresos,
    actualizarEgreso, 
} = require('../controllers/egreso.controllers');

const router = Router();

router.get('/:id', validarJWT, getEgreso);
router.get('/', validarJWT, listarEgresos);
router.post('/',[
    validarJWT,
    check('descripcion_cliente', 'La descripcion del cliente es obligatoria').not().isEmpty(),
    check('tipo_identificacion_cliente','El tipo de identificacion del cliente es obligatorio').not().isEmpty(),
    check('identificacion_cliente','La identificacion del cliente es obligatoria').not().isEmpty(),
    validarCampos
],nuevoEgreso);
router.put('/:id',  validarJWT, actualizarEgreso);

module.exports = router;