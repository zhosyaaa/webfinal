const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    books: [{
        title: {
            type: String,
            required: true
        },
        author: {
            type: String,
            required: true
        },
        publishDate: {
            type: String,
            required: true
        }
    }]
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;