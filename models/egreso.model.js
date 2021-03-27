const { Schema, model } = require('mongoose');

// Productos - Salida
const productoSchema = Schema({

    codigo: {
        type: Number,
        min: 0,
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

// Nota de venta
const egresoSchema = Schema({

    descripcion_cliente: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'La descripcion del cliente es un campo obligatorio'
    },

    tipo_identificacion_cliente: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'El tipo de identificacion es un campo obligatorio'        
    },

    identificacion_cliente: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'La identificacion del cliente es un campo obligatorio'        
    },

    codigo: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'El codigo de egreso es un campo obligatorio'
    },

    fecha_egreso: {
        type: Date,
        default: Date.now()
    },
    
    estado: {
        type: String,
        default: 'En proceso'            
    },

    activo: {
        type: Boolean,
        default: true
    },

    // Datos de producto
    productos: [productoSchema]

},{
    timestamps: true
});

module.exports = model('egreso', egresoSchema);