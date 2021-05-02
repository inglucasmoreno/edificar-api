const { Router } = require('express');
const { validarJWT } = require('../middleware/validar-jwt');
const {
    usuarios,
    productos,
    trazabilidad,
    unidad_medida,
    ingresos,
    egresos,
    proveedores,
    guiaUsuario
} = require('../controllers/reportes.controllers');

const router = Router();

router.get('/guia', guiaUsuario);
router.get('/usuarios', validarJWT, usuarios);
router.get('/productos', validarJWT, productos);
router.get('/unidades', validarJWT, unidad_medida);
router.get('/ingresos', validarJWT, ingresos);
router.get('/egresos', validarJWT, egresos);
router.get('/proveedores', validarJWT, proveedores);
router.get('/trazabilidad', validarJWT, trazabilidad);

module.exports = router;