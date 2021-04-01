const { Schema, model } = require('mongoose');

const usuarioSchema = Schema({
    
    dni: {  // Usuario del sistema
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    apellido: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
    },

    nombre: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        unique: true
    },

    role: {
        type: String,
        required: true,
        uppercase: true,
        default: 'USER_ROLE'
    },

    activo: {
        type: Boolean,
        required: true,
        default: true
    }

}, { timestamps: true } );

usuarioSchema.method('toJSON', function(){
    const {__v, _id, password, ...object} = this.toObject();
    object.uid = _id;
    return object;
});

module.exports = model('usuario', usuarioSchema);