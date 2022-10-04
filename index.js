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
  console.log(id);
  console.log(`Socket connected: ${id}`);

  socket.on('message-to-me', (msg) => {
    msg.type = 'me';
    socket.emit('message-to-me', msg);
  });

  const {
    roomName
  } = socket.handshake.query;
  console.log(`Socket roomName: ${roomName}`);
  socket.join(roomName);
  socket.on('message-to-room', (msg) => {
    msg.type = `room: ${roomName}`;
    socket.to(roomName).emit('message-to-room', msg);
    socket.emit('message-to-room', msg);
  });

  // socket.on('disconnect', () => {
  //   console.log(`Socket disconnected: ${id}`);
  // });
});