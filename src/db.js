//затребуем библ-ку mongoose

const mongoose = require('mongoose');

module.exports = {
    connect: DB_HOST => {
        //настраиваем БД
        mongoose.set('useNewUrlParser', true);
        mongoose.set('useFindAndModify', false);
        mongoose.set('useCreateIndex', true);
        mongoose.set('useUnifiedTopology', true);
        //подключаемся к БД
        mongoose.connect(DB_HOST);
        //если неуспешное подкл-е
        mongoose.connection.on('error', err => {
            console.error(err);
            console.log('MongoDB connection error БЛИИИИИН!!');
            process.exit();
        });
    },
    close: () => {
        mongoose.connection.close();
    }
};