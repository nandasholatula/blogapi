const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let blogs = [];

// Serve the HTML file at /cobadulu
app.get('/backend', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'inicobadulu.html'));
});

// Create Blog
app.post('/api/blogs', (req, res) => {
    const { title, description, imageLink } = req.body;
    const id = blogs.length + 1;
    const newBlog = { id, title, description, imageLink };
    blogs.push(newBlog);
    res.status(201).json({ result: [newBlog] });
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
    res.json({ result: [blog] });
});

// Delete Blog by ID
app.delete('/api/blogs/:id', (req, res) => {
    const blogIndex = blogs.findIndex(b => b.id === parseInt(req.params.id));
    if (blogIndex === -1) {
        return res.status(404).send('Blog not found');
    }
    blogs.splice(blogIndex, 1);
    res.status(204).send();
});

// Return 404 for home route
app.get('/', (req, res) => {
    res.status(200).send('Not Found');
});

// Return 404 for any undefined routes
app.use((req, res, next) => {
    res.status(200).send('Not Found');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
