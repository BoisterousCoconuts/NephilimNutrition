const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    //public facing ID, used to login along with password
    publicId: {
        type: String,
        required: true,
        unique: true
    },
    //private facing ID, used to connect with other users (Future feature)
    privateId: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
})

module.exports = mongoose.model('User', userSchema);