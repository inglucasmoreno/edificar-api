const { Schema, model } = require('mongoose');

// Productos - Entrada
const productoSchema = Schema({

    codigo: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'Codigo es un campo obligatorio'
    },

    descripcion: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'Descripcion es un campo obligatorio'
    },

    unidad_medida: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'La unidad de medida es un campo obligatorio'     
    },

    cantidad: {
        type: Number,
        min: 0,
        required: 'La cantidad es un campo obligatorio'
    }

});

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

    // Datos de productos
    productos: [productoSchema]

},{
    timestamps: true
});

module.exports = model('ingreso', ingresoSchema);