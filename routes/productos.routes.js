const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const {
    nuevoProducto, 
    listarProductos,
    getProducto,
    actualizarProducto
} = require('../controllers/productos.controllers');

const router = Router();

router.get('/', validarJWT, listarProductos);
router.get('/:id', validarJWT, getProducto);
router.post('/', validarJWT, [
    check('codigo', 'Codigo es un campo obligatorio').not().isEmpty(),
    check('descripcion', 'Descripcion es un campo obligatorio').not().isEmpty(),
    check('unidad_medida', 'Unidad de medida es un campo obligatorio').not().isEmpty(),
    check('cantidad', 'Cantidad es un campo obligatorio').not().isEmpty(),
    check('stock_minimo', 'Stock minimo es un campo obligatorio').not().isEmpty(),
    check('precio', 'Precio es un campo obligatorio').not().isEmpty(),
] ,nuevoProducto);
router.put('/:id', validarJWT, actualizarProducto);


module.exports = router;