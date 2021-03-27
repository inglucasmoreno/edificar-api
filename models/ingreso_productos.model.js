const { Schema, model } = require('mongoose'); 

const productosIngresoSchema = Schema({
    ingreso: {
        type: Schema.Types.ObjectId,
        ref: 'ingreso',
        required: 'El ingreso es obligatorio'
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
    fecha_ingreso: {
        type: Date,
        default: Date.now()
    },
    activo: {
        type: Boolean,
        default: true
    }
},{ timestamps: true, collection: 'ingreso_productos'});

module.exports = model('ingreso_productos', productosIngresoSchema);