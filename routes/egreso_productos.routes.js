const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const { 
    nuevoProducto,
    listarPorEgreso
} = require('../controllers/egreso_productos.controllers');

const router = Router();

router.get('/:egreso', listarPorEgreso);
router.post('/', nuevoProducto);

module.exports = router;