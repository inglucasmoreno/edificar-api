const { Schema, model } = require('mongoose');

const productosEgresoSchema = Schema({
    
    egreso: {
        type: Schema.Types.ObjectId,
        ref: 'egreso',
        required: 'El egreso es obligatorio'
    },
    
    producto: {
        type: Schema.Types.ObjectId,
        ref: 'producto',
        required: 'El producto es obligatorio'
    },
    
    cantidad: {
        type: Number,
        required: 'La cantidad es obligatoria'
    },
    
    cantidad_entregada: {
        type: Number,
        default: 0
    },

    cantidad_restante: {
        type: Number,
        default: 0
    },
    
    fecha_egreso: {
        type: Date,
        default: Date.now()
    },
    
    activo: {
        type: Boolean,
        default: true
    }

},{ timestamps: true, collection: 'egreso_productos' });

module.exports = model('egreso_productos', productosEgresoSchema);