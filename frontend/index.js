import { backend } from "declarations/backend";

let quill;
let loading = false;

document.addEventListener('DOMContentLoaded', async () => {
    initQuill();
    setupEventListeners();
    await loadPosts();
});

function initQuill() {
    quill = new Quill('#editor', {
        theme: 'snow',
        placeholder: 'Write your post content...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
}

function setupEventListeners() {
    const newPostBtn = document.getElementById('newPostBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const postForm = document.getElementById('postForm');
    const modal = document.getElementById('newPostForm');

    newPostBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        resetForm();
    });

    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (loading) return;

        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const body = quill.root.innerHTML;

        showLoading();
        try {
            await backend.createPost(title, body, author);
            modal.classList.add('hidden');
            resetForm();
            await loadPosts();
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            hideLoading();
        }
    });
}

function resetForm() {
    document.getElementById('title').value = '';
    document.getElementById('author').value = '';
    quill.setContents([]);
}

async function loadPosts() {
    showLoading();
    try {
        const posts = await backend.getPosts();
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
    } finally {
        hideLoading();
    }
}

function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = posts.map(post => `
        <article class="post">
            <h2>${post.title}</h2>
            <div class="post-meta">
                <span class="author">By ${post.author}</span>
                <span class="date">${new Date(Number(post.timestamp) / 1000000).toLocaleDateString()}</span>
            </div>
            <div class="post-content">
                ${post.body}
            </div>
        </article>
    `).join('');
}

function showLoading() {
    loading = true;
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    loading = false;
    document.getElementById('loading').classList.add('hidden');
}
