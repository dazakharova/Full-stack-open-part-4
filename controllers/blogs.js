const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response, next) => {
    try {
        const blogs = await Blog.find({}).populate('user', { username: 1, name: 1})
        response.status(200).json(blogs)
    } catch (error) {
        next(error)
    }
})

blogsRouter.post('/', middleware.userExtractor, async (request, response, next) => {
    const { title, author, url, likes } = request.body
    const user = request.user

    try {
        const blog = new Blog({
            title: title,
            author: author,
            url: url,
            likes: likes,
            user: user.id
        })

        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        response.status(201).json(savedBlog)
    } catch (error) {
        next(error)
    }
})

blogsRouter.delete('/:id', middleware.userExtractor, async(request, response, next) => {
    if (!request.token) {
        return response.status(401).json({ error: 'no token' })
    }

    const id = request.params.id
    const user = request.user

    try {
        const blog =  await Blog.findById(id)

        if (!blog) {
            response.status(404).json({ error: 'Blog not found' })
        }

        if (user.id.toString() !== blog.user.toString()) {
            response.status(400).json({ error: 'invalid user' })
        }

        await Blog.findByIdAndDelete(id)

        response.status(204).end()
    } catch (error) {
        next(error)
    }
})

blogsRouter.put('/:id', async (request, response, next) => {
    const id = request.params.id
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    try {
        const updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true })
        if (!updatedBlog) {
            response.status(404).json({ error: 'Blog not found' });
        }
        response.status(200).json(updatedBlog)
    } catch (error) {
        next(error)
    }
})


module.exports = blogsRouter