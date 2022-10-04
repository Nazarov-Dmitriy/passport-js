const express = require('express')
const router = express.Router()
const fileMulter = require('../middleware/file')
const redis = require('redis')
const Book = require('../models/book')



const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:';

const client = redis.createClient({
    url: REDIS_URL
});

(async () => {
    client.on('error', err => console.error('client error', err));
    client.on('connect', () => console.log('client is connect'));
    await client.connect()
})()


router.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find().select('-__v')

        res.render("books/index", {
            title: "Книги",
            books: books,
        });
    } catch (e) {
        res.status(500).json(e)
    }
})

router.get('/api/books/:id', async (req, res) => {
    const {
        id
    } = req.params
    try {
        const cnt = await client.incr(id);
        const books = await Book.findById(id).select('-__v')

        res.render("books/view", {
            title: "Книга ",
            book: books,
            cnt,
            user: req.user,
            idBook: id,
        });
    } catch (e) {
        res.status(500).json(e)
    }
})

router.post('/api/create/', fileMulter.single('fileBook'), async (req, res) => {
    const {
        title,
        description,
        authors,
        favorite,
        fileCover,
        fileName,
    } = req.body
    const {
        fileBook
    } = req.body
    const newBook = new Book({
        title,
        description,
        authors,
        favorite,
        fileCover,
        fileName,
        fileBook
    })
    try {
        await newBook.save()
        res.redirect('/api/books')
    } catch (e) {
        res.status(500).json(e)
    }
})

router.get('/api/books/update/:id', async (req, res) => {
    const {
        id
    } = req.params;

    try {
        const books = await Book.findById(id).select('-__v')
        res.render("books/update", {
            title: "Редактировать книгу",
            book: books
        });
    } catch (e) {
        res.status(500).json(e)
    }
});


router.post('/api/books/update/:id', fileMulter.single('fileBook'), async (req, res) => {
    const {
        title,
        description,
        authors,
        favorite,
        fileCover,
        fileName,
    } = req.body
    const {
        fileBook
    } = req.body
    const {
        id
    } = req.params

    try {
        await Book.findByIdAndUpdate(id, {
            title: title,
            description: description,
            authors: authors,
            favorite: favorite,
            fileCover: fileCover,
            fileName: fileName,
            fileBook: fileBook
        })

        res.redirect(`/api/books`);
    } catch (e) {
        res.status(500).json(e)
    }
})



router.delete('/api/books/:id', async (req, res) => {

    const {
        id
    } = req.params
    try {
        await Book.deleteOne({
            _id: id
        })
        res.redirect(`/api/books`);
    } catch (e) {
        res.status(500).json(e)
    }
})


router.get('/api/create/', (req, res) => {
    res.render("books/create", {
        title: "Создать книгу",
        book: {},
    });
});



module.exports = router