const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt'); 
const { 
    nuevaUnidad,
    getUnidad,
    listarUnidades,
    actualizarUnidad 
} = require('../controllers/unidad_medida.controllers');

const router = Router();

router.get('/', validarJWT, listarUnidades);
router.get('/:id', validarJWT, getUnidad);
router.post('/',[
    validarJWT,
    check('descripcion', 'La descripción es obligatoria').not().isEmpty(),
    validarCampos
], nuevaUnidad);
router.put('/:id', actualizarUnidad);

module.exports = router;