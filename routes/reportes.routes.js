const { Router } = require('express');
const {
    usuarios,
    productos
} = require('../controllers/reportes.controllers');

const router = Router();

router.get('/usuarios' , usuarios);
router.get('/productos', productos);


module.exports = router;