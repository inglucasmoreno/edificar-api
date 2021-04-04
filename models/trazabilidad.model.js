const { Schema, model } = require('mongoose');

const trazabilidadSchema = Schema({

    documento: {
        type: String,
        required: 'El documento es obligatorio'
    },

    documento_codigo: {
        type: String,
        required: 'El codigo del documento es obligatorio'
    },

    persona_empresa: {
        type: String,
        required: 'La persona o empresa es obligatoria'
    },

    producto: {
        type: Schema.Types.ObjectId,
        required: 'El producto es obligatorio',
        ref: 'producto'
    },

    cantidad: {
        type: Number,
        required: 'La cantidad es obligatoria',
        min: 0
    },

    stock_anterior: {
        type: Number,
        required: 'El stock actual es obligatorio'
    },

    stock_nuevo: {
        type: Number,
        required: 'El stock nuevo es obligatorio'
    },

    tipo: {
        type: String,
        trim: true,
        required: 'El tipo de transaccion es obligatorio' 
    },

    activo: {
        type: Boolean,
        default: true
    }

},{ timestamps: true, collection: 'trazabilidad' });

module.exports = model('trazabilidad', trazabilidadSchema);

