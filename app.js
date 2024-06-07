const express = require('express')
const app = express()
const blogsRouter = require('./controllers/blogs')
const { MONGODB_URI } = require('./utils/config')
const cors = require('cors')
const mongoose = require('mongoose')
const middleware = require('./utils/middleware')

mongoose.connect(MONGODB_URI)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter)

app.use(middleware.errorHandler)

module.exports = app


