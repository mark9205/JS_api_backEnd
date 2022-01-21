//запросим библ-ку mongoose
const mongoose = require('mongoose');

//схема БД заметки
const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    favoriteCount: {
        type: Number,
        default: 0
    },
    favoriteBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
},
    { timestamps: true }
);

//модель Note со схемой
const Note = mongoose.model('Note', noteSchema);
//экспортируем модель
module.exports = Note;