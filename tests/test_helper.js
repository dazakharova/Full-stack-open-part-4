const Blog = require('../models/blog')

const initialUsers = [
    {
        username: "alice123",
        name: "Alice Johnson",
        password: "alicePassword"
    },
    {
        username: "bob456",
        name: "Bob Smith",
        password: "bobSecure"
    }
]

const initialBlogs = [
    {
        title: "Favourite food",
        author: "John Smith",
        url: "http://something.com",
        likes: 10
    },
    {
        title: "Music",
        author: "Julia May",
        url: "http://somethingelse.com",
        likes: 3
    }
]

const nonExistingId = async () => {
    const blog = new Blog({
        title: "Travel",
        url: "http://somethingelse.com",
        likes: 30
    })
    await blog.save()
    await blog.deleteOne()

    return blog._id.toString()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

module.exports = {
    initialUsers, initialBlogs, nonExistingId, blogsInDb
}