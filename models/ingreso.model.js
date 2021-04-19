const { Schema, model } = require('mongoose');

// Remito de ingreso
const ingresoSchema = Schema({

    numero_remito: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'El numero de remito es un valor obligatorio'
    },

    proveedor: {    // Relacion con el proveedor
        type: Schema.Types.ObjectId,
        ref: 'proveedor',
        required: 'El proveedor es obligatorio'
    },

    fecha_ingreso: {
        type: Date,
        default: Date.now()
    },

    estado: {
        type: String,
        default: 'Pendiente'
    },

    activo: {
        type: Boolean,
        default: true
    },

},{
    timestamps: true
});

module.exports = model('ingreso', ingresoSchema);