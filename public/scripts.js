document.addEventListener('DOMContentLoaded', function () {
    const blogForm = document.getElementById('blogForm');
    // const blogList = document.getElementById('blogList');
    const cancelButton = document.getElementById('cancelButton');

    let editingBlogId = null;

    async function fetchBlogs() {
        const response = await fetch('/api/blogs');
        const data = await response.json();
        return data.result;
    }

    async function renderBlogs() {
        const blogs = await fetchBlogs();
        blogList.innerHTML = '';
        blogs.forEach(blog => {
            const li = document.createElement('li');
            li.innerHTML = `
        <h3>${blog.title}</h3>
        <p>${blog.description}</p>
        <img src="${blog.imageLink}" alt="${blog.title}" width="100">
        <button class="edit" data-id="${blog.id}">Edit</button>
        <button class="delete" data-id="${blog.id}">Delete</button>
      `;
            blogList.appendChild(li);
        });
        addEventListeners();
    }

    function addEventListeners() {
        document.querySelectorAll('button.edit').forEach(button => {
            button.addEventListener('click', handleEditClick);
        });
        document.querySelectorAll('button.delete').forEach(button => {
            button.addEventListener('click', handleDeleteClick);
        });
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const imageLink = document.getElementById('imageLink').value;
        const blogId = document.getElementById('blogId').value;

        const blogData = { title, description, imageLink };

        if (editingBlogId) {
            await fetch(`/api/blogs/${editingBlogId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(blogData),
            });
            editingBlogId = null;
        } else {
            await fetch('/api/blogs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(blogData),
            });
        }

        blogForm.reset();
        cancelButton.style.display = 'none';
        // renderBlogs();
    }

    async function handleEditClick(event) {
        const blogId = event.target.dataset.id;
        const response = await fetch(`/api/blogs/${blogId}`);
        const data = await response.json();
        const blog = data.result[0];

        document.getElementById('title').value = blog.title;
        document.getElementById('description').value = blog.description;
        document.getElementById('imageLink').value = blog.imageLink;
        document.getElementById('blogId').value = blog.id;

        editingBlogId = blog.id;
        cancelButton.style.display = 'inline';
    }

    async function handleDeleteClick(event) {
        const blogId = event.target.dataset.id;
        await fetch(`/api/blogs/${blogId}`, {
            method: 'DELETE',
        });
        // renderBlogs();
    }

    function handleCancelClick() {
        blogForm.reset();
        cancelButton.style.display = 'none';
        editingBlogId = null;
    }

    blogForm.addEventListener('submit', handleFormSubmit);
    cancelButton.addEventListener('click', handleCancelClick);

    // renderBlogs();
});
