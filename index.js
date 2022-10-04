const express = require('express')
const methodOverride = require('method-override')
const error404 = require('./middleware/err-404')
const booksRouter = require('./routes/books')
const userRouter = require('./routes/users')
const passport = require('passport')
const session = require('express-session')
const mongoose = require('mongoose')
require('dotenv').config()
const socketIO = require('socket.io');
const app = express()
const UrlDB = process.env.ME_CONFIG_MONGODB_URL
const DATABESE = process.env.ME_CONFIG_MONGODB_DATABASEE
const PORT = process.env.PORT || 7070
const Books = require('./models/book')


app.use(express.urlencoded({
  extended: true
}))
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method
    delete req.body._method
    return method
  }
}))
app.set('view engine', 'ejs')

app.use(session({
  secret: 'SECRET'
}));

app.use(passport.initialize())
app.use(passport.session())

app.use('/', userRouter)
app.use('/', booksRouter)
app.use(error404)


const server = app.listen(PORT, async () => {
  try {
    console.log(`Server listener  on port ${PORT}`);
    await mongoose.connect(UrlDB, {
      dbName: DATABESE
    })
    console.log('Mongo started');
  } catch (e) {
    console.log(e);
  }
});


const io = socketIO(server);
io.on('connection', (socket) => {
  const {
    id
  } = socket;

  const {
    roomName
  } = socket.handshake.query;
  socket.join(roomName);

  socket.on('message-to-room',async(msg) => {
    try {
      const book = await Books.findById(msg.bookId);
      console.log(book);
      if (book) {
        book.messages.push(msg);
        book.save();
        socket.to(roomName).emit('message-to-room', msg);
          socket.emit('message-to-room', msg);
      } else {
        socket.emit('error', {
          message: 'Error update book',
        });
      }
    } catch (e) {
      socket.emit('error', {
        message: 'Error update book',
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${id}`);
  });
});