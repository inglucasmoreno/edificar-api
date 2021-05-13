const { Schema, model } = require('mongoose');

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
        type: Schema.Types.ObjectId,
        ref: 'unidad_medida',
        uppercase: true,
        required: 'La unidad de medida es un campo obligatorio'     
    },
   
    cantidad: {
        type: Number,
        required: 'Cantidad es un campo obligatorio',
        min: 0     
    },
   
    stock_minimo: {
        type: Boolean,
        required: 'Stock minimo es un campo obligatorio',
        default: false
    },
   
    cantidad_minima: {
        type: Number,
        required: 'Cantidad_minima es un campo obligatorio',
        default: 0,
        min: 0          
    },
   
    precio: {
        type: Number, // revisar decimales
        required: 'Precio es un campo obligatorio',
        // min: 0
    },
   
    activo: {
        type: Boolean,
        required: 'Activo es un campo obligatorio',
        default: true 
    }

}, { timestamps: true } );

module.exports = model('producto', productoSchema);