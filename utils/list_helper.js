const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    let total = 0
    blogs.forEach(blog => {
        total += blog.likes
    })

    return total
}

const favouriteBlog = (blogs) => {
    let mostLikes = 0
    let favouriteBlog = null

    blogs.forEach(blog => {
        if (blog.likes > mostLikes) {
            mostLikes = blog.likes
            favouriteBlog = blog
        }
    })

    return favouriteBlog
}

const mostBlogs = blogs => {
    const blogsCount = {};

    blogs.forEach(({ author }) => {
        if (!blogsCount[author]) {
            blogsCount[author] = 1;
        } else {
            blogsCount[author] += 1;
        }
    });

    let maxBlogs = 0;
    let popularAuthor = {};

    for (const author in blogsCount) {
        if (blogsCount[author] > maxBlogs) {
            maxBlogs = blogsCount[author];
            popularAuthor = { author, blogs: blogsCount[author] };
        }
    }

    return popularAuthor;
}

const mostLikes = (blogs) => {
    const likesCount = {};

    blogs.forEach(({ author, likes }) => {
        if (!likesCount[author]) {
            likesCount[author] = likes;
        } else {
            likesCount[author] += likes;
        }
    });

    let maxLikes = 0;
    let popularAuthor = {};

    for (const author in likesCount) {
        if (likesCount[author] > maxLikes) {
            maxLikes = likesCount[author];
            popularAuthor = { author, likes: likesCount[author] };
        }
    }

    return popularAuthor;
}

module.exports = {
    dummy,
    totalLikes,
    favouriteBlog,
    mostBlogs,
    mostLikes
}