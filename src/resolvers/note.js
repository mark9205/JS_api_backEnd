module.exports = {
    //при запросе разреш-ся инф-я об авторе заметки
    author: async (note, args, { models }) => {
        return await models.User.findById(note.author)
    },
    //при запросе разреш-ся инф-я favoritedBy для заметки
    favoritedBy: async (note, args, { models }) => {
        return await models.User.find({ _id: { $in: note.favoritedBy } })
    }
}