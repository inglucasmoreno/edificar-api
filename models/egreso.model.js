const { Schema, model } = require('mongoose');

// Nota de venta
const egresoSchema = Schema({
    
    codigo: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'El codigo de egreso es un campo obligatorio'
    },

    // Codigo en formato String - 8 Caracteres
    codigo_cadena: {
        type: String,
        uppercase: true,
        required: 'El codigo_muestra es obligatorio'
    },

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


    fecha_egreso: {
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

module.exports = model('egreso', egresoSchema);