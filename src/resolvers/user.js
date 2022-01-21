module.exports = {
    //при запросе разреш-ся список заметок автора
    notes: async (user, args, { models }) => {
        return await models.Note.find({ author: user._id }).sort({ _id: -1 })
    },
    favorites: async (user, args, { models }) => {
        //при запросе разреш-ся список избр-х заметок
        return await models.User.find({ favoritedBy: user._id }).sort({ _id: -1 })
    }
}