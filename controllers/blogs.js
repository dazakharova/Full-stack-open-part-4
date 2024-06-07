const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response, next) => {
    try {
        const blogs = await Blog.find({})
        response.status(200).json(blogs)
    } catch (error) {
        next(error)
    }
})

blogsRouter.post('/', async (request, response, next) => {
    const blog = new Blog(request.body)

    try {
        const savedBlog = await blog.save()
        response.status(201).json(savedBlog)
    } catch (error) {
        next(error)
    }
})

blogsRouter.delete('/:id', async(request, response, next) => {
    const id = request.params.id

    try {
        const result = await Blog.findByIdAndDelete(id)

        if (!result) {
            response.status(404).json({ error: 'Blog not found' });
        } else {
            response.status(204).end();
        }
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