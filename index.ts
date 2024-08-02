const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const app = express();
const axios = require('axios');
const PORT = process.env.PORT || 8081;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const blogsFilePath = path.join(__dirname, 'blogs.json');
let blogs = [];

// Load blogs from file if it exists and is not empty
if (fs.existsSync(blogsFilePath)) {
    try {
        const blogsData = fs.readFileSync(blogsFilePath, 'utf8');
        if (blogsData) {
            blogs = JSON.parse(blogsData);
        }
    } catch (err) {
        console.error('Error reading or parsing blogs.json:', err);
    }
}

// Save blogs to file
function saveBlogsToFile() {
    try {
        fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2));
    } catch (err) {
        console.error('Error writing to blogs.json:', err);
    }
}

// Serve the HTML file at /backend
app.get('/backend', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'inicobadulu.html'));
});

// Create Blog
app.post('/api/blogs', (req, res) => {
    const { title, description, imageLink } = req.body;

    axios.post('http://api.genbyz.my.id/insert.php', new URLSearchParams({
        title: title,
        description: description,
        imageLink: imageLink
    }))
    .then(response => {
        const data = response.data;
        if (data.status === 'success') {
            res.status(201).json({ result: { id: data.id, title, description, imageLink } });
        } else {
            console.error('PHP script error:', data.message);
            res.status(500).json({ error: 'Internal Server Error', details: data.message });
        }
    })
    .catch(error => {
        if (error.response) {
            console.error('Response error:', error.response.data);
            res.status(500).json({ error: 'Internal Server Error', details: error.response.data });
        } else if (error.request) {
            console.error('Request error:', error.request);
            res.status(500).json({ error: 'Internal Server Error', details: 'No response received from PHP script' });
        } else {
            console.error('Unexpected error:', error.message);
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    });
});

// Read All Blogs
app.get('/api/blogs', (req, res) => {
    res.json({ result: blogs });
});

// Read Single Blog by ID
app.get('/api/blogs/:id', (req, res) => {
    const blog = blogs.find(b => b.id === parseInt(req.params.id));
    if (!blog) {
        return res.status(404).send('Blog not found');
    }
    res.json({ result: [blog] });
});

// Update Blog by ID
app.put('/api/blogs/:id', (req, res) => {
    const blog = blogs.find(b => b.id === parseInt(req.params.id));
    if (!blog) {
        return res.status(404).send('Blog not found');
    }
    const { title, description, imageLink } = req.body;
    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.imageLink = imageLink || blog.imageLink;
    saveBlogsToFile();
    res.json({ result: [blog] });
});

// Delete Blog by ID
app.delete('/api/blogs/:id', (req, res) => {
    const blogIndex = blogs.findIndex(b => b.id === parseInt(req.params.id));
    if (blogIndex === -1) {
        return res.status(404).send('Blog not found');
    }
    blogs.splice(blogIndex, 1);
    saveBlogsToFile();
    res.status(204).send();
});

// Return 404 for home route
app.get('/', (req, res) => {
    res.status(404).send('Not Found');
});

// Return 404 for any undefined routes
app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
