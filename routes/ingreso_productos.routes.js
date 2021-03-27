const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const { 
    nuevoProducto, 
    listarPorIngreso 
} = require('../controllers/ingreso_productos.controllers');

const router = Router();

router.get('/:ingreso', listarPorIngreso);
router.post('/', nuevoProducto);


module.exports = router;