const mongoose = require('mongoose');

//схема БД пользователя
const UserSchema = new mongoose.Schema({
        username: {
            type: String,
            required: true,
            index: {unique: true}
        },
        email: {
            type: String,
            required: true,
            index: {unique: true}
        },
        password: {
            type: String,
            required: true
        },
        avatar: {
            type: String
        }
    },
// присваиваем поля createdAt и updatedAt  с типом Date
    {timestamps: true}
);

//модель User со схемой
const User = mongoose.model('User', UserSchema);
//экспортируем модель
module.exports = User;