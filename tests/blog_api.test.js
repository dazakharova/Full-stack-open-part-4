const { test, after, beforeEach, beforeAll } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

async function loginUser() {
    const response = await api.post('/api/login').send({
        username: 'alice123',
        password: 'alicePassword'
    })
    return response.body.token
}

beforeEach(async () => {
    await User.deleteMany({})

    const userPromises = helper.initialUsers.map(user => {
        return bcrypt.hash(user.password, 10).then(hashedPassword => {
            return new User({
                username: user.username,
                name: user.name,
                passwordHash: hashedPassword
            })
        })
    })

    const userObjects = await Promise.all(userPromises)

    const promiseArrayUsers = userObjects.map(userObject => userObject.save())

    await Blog.deleteMany({});

    const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
    const promiseArrayBlogs = blogObjects.map(blogObject => blogObject.save())

    await Promise.all([...promiseArrayUsers, ...promiseArrayBlogs])
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
    const token = await loginUser()

     const newBlog = {
        title: "Travel",
        author: "Liza Simpson",
        url: "http://somethingelse.com",
        likes: 30
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .set({ Authorization: `Bearer ${token}` })
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const authors = blogsAtEnd.map(r => r.author)
    assert(authors.includes('Liza Simpson'))
})

test('likes property is set to default 0 when missing', async () => {
    const token = await loginUser()

    const newBlog = {
        title: "Cooking",
        author: "Kate Winston",
        url: "http://bestcook.com"
    }

    const response = await api
        .post('/api/blogs')
        .set({ Authorization: `Bearer ${token}` })
        .send(newBlog)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    assert.strictEqual(response.body.likes, 0)
})

test('creating new blog without title returns 400 Bad Request', async () => {
    const token = await loginUser()

    const newBlog = {
        author: "Max Litt",
        url: "http://maxlitt.com"
    }

    await api
        .post('/api/blogs')
        .set({ Authorization: `Bearer ${token}` })
        .send(newBlog)
        .expect(400)
})

test('creating new blog without url returns 400 Bad Request', async () => {
    const token = await loginUser()

    const newBlog = {
        title: "Cars",
        author: "Max Litt"
    }

    await api
        .post('/api/blogs')
        .set({ Authorization: `Bearer ${token}` })
        .send(newBlog)
        .expect(400)
})

test('a blog with a valid id can be deleted', async () => {
    const token = await loginUser()

    const newBlog = {
        title: "Travel",
        author: "Liza Simpson",
        url: "http://somethingelse.com",
        likes: 30
    }

    const postResponse = await api
        .post('/api/blogs')
        .set({ Authorization: `Bearer ${token}` })
        .send(newBlog)
    const blogId = postResponse.body.id

    const blogsAtEnd = await helper.blogsInDb()
    const blogToDelete = blogsAtEnd[1]

    await api
        .delete(`/api/blogs/${blogId}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(204)

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
})

test('deleting a blog with an invalid id returns 404 Not Found', async() => {
    const token = await loginUser()

    const invalidId = '5e9f8f8f8f8f8f8f8f8f8f8f'

    await api
        .delete(`/api/blogs/${invalidId}`)
        .set({ Authorization: `Bearer ${token}` })
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

test('creating a user with too short password returns 400 Bad Request', async () => {
    const token = await loginUser()

    const newUser = {
        username: 'ghost',
        name: 'Kevin Kevin',
        password: 'tr'
    }

    await api
        .post('/api/users')
        .set({ Authorization: `Bearer ${token}` })
        .send(newUser)
        .expect(400)
})

test('creating a user with too short username returns 400 Bad Request', async () => {
    const token = await loginUser()

    const newUser = {
        username: 'gg',
        name: 'Great Gatsby',
        password: 'greenlight'
    }

    await api
        .post('/api/users')
        .set({ Authorization: `Bearer ${token}` })
        .send(newUser)
        .expect(400)
})

test('adding a new blog fails with the proper status code 401 Unauthorized if a token is not provided', async () => {
    const newBlog = {
        title: "Travel",
        author: "Liza Simpson",
        url: "http://somethingelse.com",
        likes: 30
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
})

after(async () => {
    await mongoose.connection.close()
})