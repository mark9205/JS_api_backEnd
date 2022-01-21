const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
require('dotenv').config();
const mongoose = require('mongoose');
const gravatar = require('../util/gravatar');


module.exports = {
    newNote: async (parent, args, { models, user }) => {
        //если в контексте нет поль-ля, выбрас-ем AuthenticationError
        if (!user) {
            throw new AuthenticationError('You must be signed in to create a note');
        }
        return await models.Note.create({
            content: args.content,
            //ссылаемся на mongo id автора
            author: mongoose.Types.ObjectId(user.id)
        });
    },
    deleteNote: async (parent, { id }, { models, user }) => {
        if (!user) {
            throw new AuthenticationError('You must be signed in to create a note');
        }
        //находим заметку
        const note = await models.Note.findById(id);
        //если владелец заметки и текущий польз-ль не совпадают, выбр. запрет на удаление
        if (note && String(note.author) !== user.id) {
            throw new ForbiddenError("you don't have permission to delete this note");
        }
        try {
            //если проверки прошли, удаляем заметку
            await models.Note.findOneAndRemove({ _id: id });
            return true;
        } catch (err) {
            //если ошибка - вернем false
            return false;
        }
    },
    updateNote: async (parent, { content, id }, { models, user }) => {
        if (!user) {
            throw new AuthenticationError('You must be signed in to update a note');
        }
        // находим заметку
        const note = await models.Note.findById(id);
        //если владелец заметки и текущий польз-ль не совпадают, выбр. запрет на удаление
        if (note && String(note.author) !== user.id) {
            throw new ForbiddenError("you don't have permission to update this note");
        }
        //обновляем заметку в бд и возвращаем ее в обновл-м виде
        return await models.Note.findOneAndUpdate(
            { _id: id },
            { $set: { content } },
            { new: true }
        );
    },
    signUp: async (parent, { username, email, password }, { models }) => {
        // нормализуем email
        email = email.trim().toLowerCase();
        //хэшируем пароль
        const hashed = await bcrypt.hash(password, 10);
        //создаем url gravatar-изображ-я
        const avatar = gravatar(email);
        try {
            const user = await models.User.create({
                username,
                email,
                avatar,
                password: hashed
            });
            //создаем и возвращаем json web токен
            return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        } catch (err) {
            console.log(err);
            //если при рег-ции возникла проблема, выбрасываем ош-ку
            throw new Error('Error creating account');
        }
    },
    signIn: async (parent, { username, email, password }, { models }) => {
        if (email) {
            email = email.trim().toLowerCase();
        }

        const user = await models.User.findOne({
            $or: [{ email }, { username }]
        });

        if (!user) {
            throw new AuthenticationError('Error singing in');
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new AuthenticationError('Error singing in');
        }

        return jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    },
    toggleFavorite: async (parent, { id }, { models, user }) => {
        if (!user) {
            throw new AuthenticationError();
        }
        //проверим, отмечал ли польз-ль заметку как избранную
        const noteCheck = await models.Note.findById(id);
        const hasUser = noteCheck.favoriteBy.indexOf(user.id)
        //если польз-ль есть в списке - убираем его оттуда и уменьш. знач-е favoriteCount на 1
        if (hasUser >= 0) {
            return await models.Note.findByIdAndUpdate(
                id,
                {
                    $pull: {
                        favoritedBy: mongoose.Types.ObjectId(user.id)
                    },
                    $inc: {
                        favoriteCount: -1
                    }
                },
                {
                    new: true
                }
            )
        }
        else {
            //если польз-ля нет в списке - добавляем его туда и увел. знач-е favoriteCount на 1
            return await models.Note.findByIdAndUpdate(
                id,
                {
                    $push: {
                        favoriteBy: mongoose.Types.ObjectId(user.id)
                    },
                    $inc: {
                        favoriteCount: 1
                    }
                },
                {
                    new: true
                }
            )
        }
    }
}