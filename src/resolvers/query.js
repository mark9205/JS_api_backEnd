module.exports = {
    notes: async (parent, args, { models }) => {
        return await models.Note.find().limit(100);
    },
    note: async (parent, args, { models }) => {
        return await models.Note.findById(args.id);
    },
    user: async (parent, args, { username }, { models }) => {
        //находим польз-ля по имени
        return await models.User.findOne({ username });
    },
    users: async (parent, args, { models }) => {
        //находим всех польз-лей
        return await models.User.find({});
    },
    me: async (parent, args, { models, user }) => {
        //находим польз-ля по текущему польз-му контексту
        return await models.User.findById(user.id);
    },
    noteFeed: async (parent, { cursor }, { models }) => {
        //хардкодим лимит в 10 элементов
        const limit = 10
        //уст-м знач-е false по умолч-ю для hasnextpage
        let hasNextPage = false
        //если курсор передан не будет, то по умол-ю запрос будет пуст
        //и из БД будут извлечены посл-е заметки
        let cursorQuery = {}
        //если курсор задан, запрос ищет заметки со знач-м objectId
        //меньше этого курсора
        if (cursor) {
            cursorQuery = { _id: { $lt: cursor } }
        }
        //находим в бд limit+1 заметок, сортируя их
        let notes = await models.Note.find(cursorQuery)
            .sort({ _id: -1 })
            .limit(limit + 1);
        //если число найд-х заметок превыш-т limit, устан-м
        //hasNextPage в true и обрезаем заметки до лимита
        if (notes.length > limit) {
            hasNextPage = true
            notes = notes.slice(0, -1)
        }
        //новым курсором будет ID Mongo-объекта последнего эл-та массива списка
        const newCursor = notes[notes.length - 1]._id

        return {
            notes,
            cursor: newCursor,
            hasNextPage
        };
    }
}