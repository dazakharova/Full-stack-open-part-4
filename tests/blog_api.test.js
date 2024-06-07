const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blogObject => blogObject.save())

    await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('blog posts have id property', async () => {
    const response = await api.get('/api/blogs')
    const id = response.body.map(e => e.id)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(id.length, blogsAtEnd.length)
})

test('a valid blog can be added', async () => {
    const newBlog = {
        title: "Travel",
        author: "Liza Simpson",
        url: "http://somethingelse.com",
        likes: 30
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const authors = blogsAtEnd.map(r => r.author)
    assert(authors.includes('Liza Simpson'))
})

test('likes property is set to default 0 when missing', async () => {
    const newBlog = {
        title: "Cooking",
        author: "Kate Winston",
        url: "http://bestcook.com"
    }

    const response = await api.post('/api/blogs').send(newBlog)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    assert.strictEqual(response.body.likes, 0)
})

test('creating new blog without title returns 400 Bad Request', async () => {
    const newBlog = {
        author: "Max Litt",
        url: "http://maxlitt.com"
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
})

test('creating new blog without url returns 400 Bad Request', async () => {
    const newBlog = {
        title: "Cars",
        author: "Max Litt"
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
})

test('a blog with a valid id can be deleted', async () => {
    const blogsAtEnd = await helper.blogsInDb()
    const blogToDelete = blogsAtEnd[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
})

test('deleting a blog with an invalid id returns 404 Not Found', async() => {
    const invalidId = '5e9f8f8f8f8f8f8f8f8f8f8f'

    await api
        .delete(`/api/blogs/${invalidId}`)
        .expect(404)
})

test('a blog with a valid id can be successfully updated', async () => {
    const blogsAtEnd = await helper.blogsInDb()
    const blogToUpdate = blogsAtEnd[0]
    const newBlog = {
        title: "Favourite food",
        author: "John Smith",
        url: "http://something.com",
        likes: 50
    }

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('updating a blog with an invalid id returns 404 Not Found', async () => {
    const invalidId = '5e9f8f8f8f8f8f8f8f8f8f8f'
    const newBlog = {
        title: "Favourite food",
        author: "John Smith",
        url: "http://something.com",
        likes: 50
    }

    await api
        .put(`/api/blogs/${invalidId}`)
        .send(newBlog)
        .expect(404)
})

after(async () => {
    await mongoose.connection.close()
})