const express = require('express')
const redis = require('redis')
const router = express.Router()


// увеличить счётчик POST /counter/:bookId/incr;
// получить значение счётчика GET /counter/:bookId — приложение контейнеризировано.

const REDIS_URL =process.env.REDIS_URL || 'localhost';

const client = redis.createClient({url:REDIS_URL});

(async()=>{
    await client.connect()
    
})()