/**
 * Forum Manager - Handles all forum-related functionality including categories, posts, and user interactions
 * Implements a progressive loading strategy where initial content is shown immediately and then updated with Firebase data
 */

class ForumManager {
    constructor() {
        console.log('Initializing ForumManager');
        
        // Initialize properties
        this.defaultProfilePic = '/images/default profile.jpg'; // Fixed path to match actual location
        this.categories = [
            { 
                id: 'strength-training', 
                name: 'Strength Training', 
                icon: 'bi-lightning-charge-fill', 
                description: 'Weightlifting, resistance training, and muscle building techniques',
                initialCounts: { topics: '...', posts: '...' }
            },
            { 
                id: 'cardio-fitness', 
                name: 'Cardio Fitness', 
                icon: 'bi-heart-fill', 
                description: 'Running, cycling, swimming, and endurance training',
                initialCounts: { topics: '...', posts: '...' }
            },
            { 
                id: 'nutrition', 
                name: 'Nutrition', 
                icon: 'bi-egg-fried', 
                description: 'Diet plans, meal prep, supplements, and nutritional advice',
                initialCounts: { topics: '...', posts: '...' }
            },
            { 
                id: 'weight-loss', 
                name: 'Weight Loss', 
                icon: 'bi-graph-down', 
                description: 'Weight loss journeys, tips, and motivational stories',
                initialCounts: { topics: '...', posts: '...' }
            },
            { 
                id: 'recovery', 
                name: 'Recovery & Wellness', 
                icon: 'bi-bandaid', 
                description: 'Injury prevention, rest, mental health, and holistic wellness',
                initialCounts: { topics: '...', posts: '...' }
            },
            { 
                id: 'general', 
                name: 'General Discussion', 
                icon: 'bi-chat-dots', 
                description: 'Open forum for fitness-related conversations',
                initialCounts: { topics: '...', posts: '...' }
            }
        ];

        this.currentCategory = null;
        this.currentUser = null;
        this.isFirebaseInitialized = false;
        this.db = null;
        this.auth = null;
        
        // Render initial content immediately
        this.renderCategories(true);
        
        // Initialize Firebase and update content
        this.initializeFirebase();
        
        // Bind event handlers
        this.bindEventHandlers();
    }

    async initializeFirebase() {
        try {
            // Initialize Firebase components
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            console.log('Firebase initialized, setting up auth listener');
            
            // Set up auth listener
            this.auth.onAuthStateChanged(user => {
                console.log('Auth state changed:', user ? 'User logged in' : 'No user');
                this.currentUser = user;
                this.isFirebaseInitialized = true;
                
                // Update categories with real data
                this.renderCategories(false);
            });
        } catch (error) {
            console.error('Error initializing Firebase:', error);
            this.showAlert('Error connecting to the server. Some features may be limited.', 'warning');
        }
    }

    bindEventHandlers() {
        // Bind form handlers
        const createPostForm = document.getElementById('createPostForm');
        if (createPostForm) {
            createPostForm.addEventListener('submit', this.handlePostCreation.bind(this));
        }
        
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
        
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegistration.bind(this));
        }

        // Initialize toastr
        toastr.options = {
            "closeButton": true,
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "3000"
        };
    }

    async renderCategories(isInitialRender = false) {
        console.log('Rendering categories, initial render:', isInitialRender);
        
        const forumContent = document.getElementById('forumContent');
        if (!forumContent) return;

        let html = '<div class="row g-4">';
        
        for (const category of this.categories) {
            // Get counts based on render type
            const counts = isInitialRender ? 
                category.initialCounts : 
                await this.getCategoryCounts(category.id);
            
            html += `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="category-card">
                        <i class="bi ${category.icon}"></i>
                        <h3 class="card-title">${category.name}</h3>
                        <p class="category-description">${category.description}</p>
                        <div class="category-stats">
                            <span class="badge bg-primary me-2">
                                <span class="count-value">${counts.topics}</span> Topics
                            </span>
                            <span class="badge bg-secondary">
                                <span class="count-value">${counts.posts}</span> Posts
                            </span>
                        </div>
                        <button class="btn btn-outline-primary mt-3" 
                                onclick="forumManager.loadCategoryPosts('${category.id}')"
                                ${!this.isFirebaseInitialized ? 'disabled' : ''}>
                            ${!this.isFirebaseInitialized ? 'Loading...' : 'View Topics'}
                        </button>
                    </div>
                </div>`;
        }
        
        html += '</div>';
        forumContent.innerHTML = html;
    }

    async handlePostCreation(event) {
        event.preventDefault();

        const title = document.getElementById('postTitle').value.trim();
        const content = document.getElementById('postContent').value.trim();

        if (!title || !content) {
            this.showAlert('Please fill in both the title and content fields.', 'warning');
            return;
        }

        const post = {
            title: title,
            content: content,
            category: this.currentCategory,
            author: this.currentUser ? this.currentUser.email : 'Guest',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            replyTo: null  // Explicitly mark as main post
        };

        try {
            await this.db.collection('posts').add(post);
            this.showAlert('Post created successfully!', 'success');
            // Clear the form
            document.getElementById('postTitle').value = '';
            document.getElementById('postContent').value = '';
            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('createPostModal'));
            if (modal) {
                modal.hide();
            }
            // Refresh the current view
            if (this.currentCategory) {
                this.loadCategoryPosts(this.currentCategory);
            }
        } catch (error) {
            console.error('Error creating post:', error);
            this.showAlert('Error creating post: ' + error.message, 'danger');
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            console.log('User logged in:', userCredential.user.email);
            toastr.success('Logged in successfully!');
            // Close the login modal if it exists
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            if (loginModal) {
                loginModal.hide();
            }
        } catch (error) {
            console.error('Error logging in:', error);
            toastr.error(error.message);
        }
    }

    async handleRegistration(event) {
        event.preventDefault();
        
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();
        
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            console.log('User created:', userCredential.user.email);
            toastr.success('Account created successfully!');
            // Close the registration modal if it exists
            const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            if (registerModal) {
                registerModal.hide();
            }
        } catch (error) {
            console.error('Error creating account:', error);
            toastr.error(error.message);
        }
    }

    showAlert(message, type = 'info') {
        // Remove any existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Create new alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.setAttribute('role', 'alert');
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Add to document
        document.body.appendChild(alert);

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            const alertInstance = bootstrap.Alert.getInstance(alert);
            if (alertInstance) {
                alertInstance.close();
            } else {
                alert.remove();
            }
        }, 5000);
    }

    async getCategoryCounts(categoryId) {
        // If Firebase isn't initialized yet, return placeholder counts
        if (!this.isFirebaseInitialized || !this.db) {
            return { topics: '...', posts: '...' };
        }

        try {
            // Get all posts for this category
            const postsSnapshot = await this.db.collection('posts')
                .where('category', '==', categoryId)
                .get();

            // Count unique topics (parent posts) and total posts (including replies)
            const topics = new Set();
            let totalPosts = 0;

            for (const doc of postsSnapshot.docs) {
                const post = doc.data();
                if (!post.replyTo) { // If it's a parent post
                    topics.add(doc.id);
                }
                totalPosts++;
            }

            return {
                topics: topics.size,
                posts: totalPosts
            };
        } catch (error) {
            console.error('Error getting category counts:', error);
            return { topics: 0, posts: 0 };
        }
    }

    async openCategory(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        if (!category) return;

        this.currentCategory = categoryId;
        const forumContent = document.getElementById('forumContent');
        
        try {
            // Simpler query without ordering by timestamp
            const snapshot = await this.db.collection('posts')
                .where('category', '==', categoryId)
                .get();

            const posts = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id
                };
            });
            
            // Sort posts in JavaScript instead
            posts.sort((a, b) => b.timestamp - a.timestamp);
            
            const postsHTML = posts.length > 0 
                ? posts.map(post => `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h5 class="mb-1">${post.title}</h5>
                            <small class="text-muted">${post.timestamp ? new Date(post.timestamp.toDate()).toLocaleString() : 'Just now'}</small>
                        </div>
                        <p class="mb-1">${post.content}</p>
                        <div class="d-flex justify-content-end align-items-center">
                            <small class="text-muted">Posted by ${post.author}</small>
                            <span class="badge bg-primary rounded-pill">${(post.replies?.length || 0) + 1} posts</span>
                        </div>
                    </div>
                `).join('')
                : `<div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">No topics yet. Be the first to create one!</h5>
                    </div>
                   </div>`;

            forumContent.innerHTML = `
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2>${category.name}</h2>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createPostModal">
                            <i class="bi bi-plus-circle me-2"></i>Create Post
                        </button>
                    </div>
                    <div class="list-group">
                        ${postsHTML}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error opening category:', error);
            this.showAlert('Error loading posts: ' + error.message, 'danger');
        }
    }

    async loadCategoryPosts(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        if (!category) return;

        this.currentCategory = categoryId;
        const forumContent = document.getElementById('forumContent');
        
        try {
            // Get all posts for this category
            const snapshot = await this.db.collection('posts')
                .where('category', '==', categoryId)
                .get();

            // Filter main posts (no replyTo field or replyTo is null)
            const mainPosts = snapshot.docs.filter(doc => {
                const data = doc.data();
                return !data.replyTo;
            });

            const posts = await Promise.all(mainPosts.map(async doc => {
                const data = doc.data();
                // Get reply count for this post
                const repliesSnapshot = await this.db.collection('posts')
                    .where('replyTo', '==', doc.id)
                    .get();
                
                return {
                    ...data,
                    id: doc.id,
                    replyCount: repliesSnapshot.size
                };
            }));
            
            posts.sort((a, b) => {
                if (!a.timestamp || !b.timestamp) return 0;
                return b.timestamp - a.timestamp;
            });
            
            const postsHTML = posts.length > 0 
                ? posts.map(post => {
                    let timeStr = 'Just now';
                    if (post.timestamp) {
                        const date = post.timestamp.toDate();
                        timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }
                    
                    return `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between align-items-start">
                            <div class="d-flex align-items-center">
                                <img src="${this.defaultProfilePic}" alt="Profile" class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">
                                <div>
                                    <h6 class="mb-0 text-primary">${post.author}</h6>
                                    <h5 class="mb-1">${post.title}</h5>
                                </div>
                            </div>
                            <small class="text-muted">${timeStr}</small>
                        </div>
                        <p class="mb-1 mt-2">${post.content}</p>
                        <div class="d-flex justify-content-end align-items-center gap-2">
                            <span class="text-muted">${post.replyCount} ${post.replyCount === 1 ? 'reply' : 'replies'}</span>
                            <button class="btn btn-primary btn-sm" onclick="forumManager.viewPost('${post.id}')">
                                <i class="bi bi-chat-text me-1"></i>View Post
                            </button>
                        </div>
                    </div>
                `}).join('')
                : `<div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">No topics yet. Be the first to create one!</h5>
                    </div>
                   </div>`;

            forumContent.innerHTML = `
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2>${category.name}</h2>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createPostModal">
                            <i class="bi bi-plus-circle me-2"></i>Create Post
                        </button>
                    </div>
                    <div class="list-group">
                        ${postsHTML}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error opening category:', error);
            this.showAlert('Error loading posts: ' + error.message, 'danger');
        }
    }

    async viewPost(postId) {
        try {
            const postDoc = await this.db.collection('posts').doc(postId).get();
            if (!postDoc.exists) {
                this.showAlert('Post not found', 'error');
                return;
            }

            const post = { ...postDoc.data(), id: postDoc.id };
            const forumContent = document.getElementById('forumContent');

            // Get replies without ordering in the query
            const repliesSnapshot = await this.db.collection('posts')
                .where('replyTo', '==', postId)
                .get();

            const replies = repliesSnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }));

            // Sort replies in JavaScript
            replies.sort((a, b) => {
                if (!a.timestamp || !b.timestamp) return 0;
                return a.timestamp.seconds - b.timestamp.seconds;
            });

            let timeStr = 'Just now';
            if (post.timestamp) {
                const date = post.timestamp.toDate();
                timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            const repliesHTML = replies.map(reply => {
                let replyTimeStr = 'Just now';
                if (reply.timestamp) {
                    const date = reply.timestamp.toDate();
                    replyTimeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }

                return `
                    <div class="list-group-item">
                        <div class="d-flex align-items-start">
                            <img src="${this.defaultProfilePic}" alt="Profile" class="rounded-circle me-2" style="width: 32px; height: 32px; object-fit: cover;">
                            <div class="flex-grow-1">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h6 class="mb-0 text-primary">${reply.author}</h6>
                                    <small class="text-muted">${replyTimeStr}</small>
                                </div>
                                <p class="mb-0 mt-1">${reply.content}</p>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            forumContent.innerHTML = `
                <div class="col-12">
                    <div class="mb-4">
                        <button class="btn btn-outline-primary mb-3" onclick="forumManager.loadCategoryPosts('${post.category}')">
                            <i class="bi bi-arrow-left me-2"></i>Back to Topics
                        </button>
                        <div class="list-group">
                            <div class="list-group-item">
                                <div class="d-flex w-100 justify-content-between align-items-start">
                                    <div class="d-flex align-items-center">
                                        <img src="${this.defaultProfilePic}" alt="Profile" class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">
                                        <div>
                                            <h6 class="mb-0 text-primary">${post.author}</h6>
                                            <h5 class="mb-1">${post.title}</h5>
                                        </div>
                                    </div>
                                    <small class="text-muted">${timeStr}</small>
                                </div>
                                <p class="mb-1 mt-2">${post.content}</p>
                            </div>
                        </div>
                    </div>

                    <div class="mb-4">
                        <h5 class="mb-3">Replies</h5>
                        <div class="list-group">
                            ${repliesHTML}
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Add Reply</h5>
                            <form id="replyForm" onsubmit="forumManager.handleReplySubmit(event, '${postId}')">
                                <div class="mb-3">
                                    <textarea class="form-control" id="replyContent" rows="3" placeholder="Write your reply..." required></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-send me-2"></i>Post Reply
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error viewing post:', error);
            this.showAlert('Error loading post: ' + error.message, 'danger');
        }
    }

    async handleReplySubmit(event, postId) {
        event.preventDefault();
        
        const content = document.getElementById('replyContent').value.trim();
        
        if (!content) {
            this.showAlert('Please write a reply before submitting.', 'warning');
            return;
        }

        const reply = {
            content: content,
            author: this.currentUser ? this.currentUser.email : 'Guest',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            replyTo: postId,  // Link to parent post
            category: this.currentCategory,
            title: null  // Replies don't have titles
        };

        try {
            await this.db.collection('posts').add(reply);
            this.showAlert('Reply posted successfully!', 'success');
            // Clear the form
            document.getElementById('replyContent').value = '';
            // Refresh the post view to show the new reply
            this.viewPost(postId);
        } catch (error) {
            console.error('Error posting reply:', error);
            this.showAlert('Error posting reply: ' + error.message, 'danger');
        }
    }
}

// Initialize after all scripts are loaded
window.addEventListener('load', function() {
    window.forumManager = new ForumManager();
});
