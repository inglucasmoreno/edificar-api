const {model, Schema} = require('mongoose');

const presupuestoSchema = Schema({
    nro_presupuesto: {
        type: Number,
        required: 'El numero es obligatorio'    
    }
});

module.exports = model('presupuesto', presupuestoSchema);