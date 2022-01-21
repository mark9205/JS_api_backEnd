const depthLimit = require('graphql-depth-limit');
const {createComplexityLimitRule} = require('graphql-validation-complexity');
const cors = require('cors')
const helmet = require('helmet')
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//импортируем локальные модули
const db = require('./db')
const models = require('./models');
const typeDefs = require('./schema')
const resolvers = require('./resolvers')

//получаем инф-ю польз-ля из JWT
const getUser = token => {
    if (token) {
        try {
            //возвр-м инф-ю о польз-ле из токена
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            //если с токеном проблема - выбрасываем ош-ку
            new Error('Seesion invalid')
        }
    }
}

//запускаем сервер на порте, указ в файле .env или на 4000
const port = process.env.PORT || 4000;
//сохраняем знач-е DB_HOST в виде переменной
const DB_HOST = process.env.DB_HOST;

const app = express();
app.use(helmet());
app.use(cors())

//подключаем БД
db.connect(DB_HOST);

//настройка Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
    context: ({ req }) => {
        //получаем токен польз-ля из заголовков
        const token = req.headers.authorization;
        //извлекаем польз-ля с помощью токена
        const user = getUser(token);
        //добавление моделей БД и польз-ля в контекст
        return { models, user }
    }
});

//применяем промеж ПО Apollo GraphQL и указ путь к api
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () =>
    console.log(`GraphQL Server running at http://localhost:${port}${server.graphqlPath}.`));










