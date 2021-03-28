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

router.get('/:id', listarPorIngreso);
router.post('/', nuevoProducto);
router.put('/parcial/:id', ingresoParcial);
router.put('/completar/:id', completarIngreso);
router.delete('/:id', eliminarProducto);

module.exports = router;