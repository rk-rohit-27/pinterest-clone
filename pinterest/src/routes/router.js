const express = require('express');
const router = express.Router();
const User = require('../models/usermodel'); // Importing user model
const Post = require('../models/postmodel'); // Importing post model
const passport = require('passport'); // Importing passport module
const localStrategy = require('passport-local'); // Importing local strategy for passport authentication
const upload = require('../middleware/multer'); // Importing multer for file uploads
const Category = require('../models/categorymodel'); // Importing category model


// Setting up local strategy for passport authentication
passport.use(new localStrategy(User.authenticate()));

// Middleware function to check if user is authenticated
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // Proceed if authenticated
    }
    res.redirect('/'); // Redirect if not authenticated
}

// Utility function to find user by session
async function findUser(req) {
    return await User.findOne({ username: req.session.passport.user }).populate("posts");
}

// Route for homepage
router.get('/', (req, res) => {
    res.render('index', { error: req.flash('error'), nav: false });
});

// Route for registration page
router.get('/register', (req, res) => {
    res.render('register', { nav: false, error: req.flash('error') });
});


// Example search route
router.get('/search', async (req, res) => {
    const searchTerm = req.query.q || ''; // Default to an empty string if not provided
    let results = {
        users: [],
        posts: []
    };

    try {
        // Search for users
        results.users = await User.find({ 
            $or: [
                { username: { $regex: searchTerm, $options: 'i' } },
                { name: { $regex: searchTerm, $options: 'i' } }
            ]
        });

        // Search for posts by categories or tags
        results.posts = await Post.find({
            $or: [
                { category: { $regex: searchTerm, $options: 'i' } },
                { tags: { $regex: searchTerm, $options: 'i' } }
            ]
        }).populate('user', 'name username profileImage'); // Populate user data

        res.render('searchResults', { results, searchTerm, nav: true }); // Pass searchTerm here
    } catch (error) {
        console.error('Error during search:', error);
        req.flash('error', 'Something went wrong while searching.');
        res.redirect('/feed');
    }
});





// Route for user profile page
router.get('/profile', isLoggedIn, async (req, res) => {
    try {
        const user = await findUser(req); // Ensure this retrieves the correct user
        const isAuthor = true; // Since this is the logged-in user's profile


        res.render('profile', { user, isAuthor, nav: true });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        req.flash('error', 'Something went wrong while fetching the profile.');
        res.redirect('/feed'); // Redirect on error
    }
});

router.get('/profile/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const userProfile = await User.findById(userId).populate('posts');

        if (!userProfile) {
            req.flash('error', 'User not found.');
            return res.redirect('/feed'); // Redirect if user not found
        }

        const isAuthor = req.user && req.user._id.equals(userProfile._id);

        

        res.render('profile', { user: userProfile, isAuthor, nav: true });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        req.flash('error', 'Something went wrong while fetching the profile.');
        res.redirect('/feed'); // Redirect on error
    }
});



// Route for showing posts
router.get('/show/posts', isLoggedIn, async (req, res) => {
    const user = await findUser(req);
    res.render('show', { user, nav: true });
});

// Route for individual post
router.get("/show/posts/:post_id", isLoggedIn, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id).populate('user');
        const currentUser = await User.findById(req.user._id).populate('following');

        const followingIds = currentUser.following.map(follow => follow._id.toString());
        const user_is_following = followingIds.includes(post.user._id.toString());

        // Check if the current user is the author of the post
        const isAuthor = post.user._id.equals(req.user._id);

        res.render('pic', { post, user: post.user, user_is_following, isAuthor, nav: true });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/edit', isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.user._id); // Fetch the logged-in user
        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/feed'); // Redirect if user not found
        }
        res.render('edit', { user, nav: true, error: null }); // Render the edit page with user data
    } catch (error) {
        console.error('Error fetching user data:', error);
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect('/feed'); // Redirect on error
    }
});

router.post('/profile/update', isLoggedIn, async (req, res) => {
    const { name, email } = req.body;
    try {
        // Update user logic here
        await User.findByIdAndUpdate(req.user._id, { name, email });
        req.flash('success', 'Profile updated successfully!');
        res.redirect('/profile');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.render('edit', {
            user: req.user,
            error: 'Failed to update profile. Please try again.'
        });
    }
});



// Route for creating a new post
router.get('/add', isLoggedIn, async (req, res) => {
    try {
        const user = await findUser(req);
        const categories = await Category.find(); // Fetch categories for the form
        res.render('add', { user, categories, nav: true }); // Pass categories to the view
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route for following a user
// Route for following a user
router.post('/follow/:userId', isLoggedIn, async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.userId);
        if (!userToFollow) {
            req.flash('error', 'User not found.');
            return res.redirect('/feed');
        }

        await req.user.follow(userToFollow._id);
        req.flash('success', `You are now following ${userToFollow.username}.`);
        return res.redirect('back'); // Redirect back to the previous page
    } catch (error) {
        console.error('Error following user:', error);
        req.flash('error', 'An error occurred while trying to follow the user.');
        return res.redirect('/feed');
    }
});

// Route for unfollowing a user
router.post('/unfollow/:userId', isLoggedIn, async (req, res) => {
    try {
        const userToUnfollow = await User.findById(req.params.userId);
        if (!userToUnfollow) {
            req.flash('error', 'User not found.');
            return res.redirect('/feed');
        }

        await req.user.unfollow(userToUnfollow._id);
        req.flash('success', `You have unfollowed ${userToUnfollow.username}.`);
        return res.redirect('back'); // Redirect back to the previous page
    } catch (error) {
        console.error('Error unfollowing user:', error);
        req.flash('error', 'An error occurred while trying to unfollow the user.');
        return res.redirect('/feed');
    }
});


// Route for feed
router.get('/feed', isLoggedIn, async (req, res) => {
    try {
        const user = await findUser(req);
        const posts = await Post.find().populate("user");
        res.render("feed", { user, posts, nav: true });
    } catch (error) {
        console.error('Error fetching feed:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route for creating a post
router.post('/createpost', isLoggedIn, upload.single("postimage"), async (req, res) => {
    try {
        const user = await User.findOne({ username: req.session.passport.user });
        const tagsArray = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [];
        const post = await Post.create({
            user: user._id,
            title: req.body.title,
            description: req.body.description,
            image: req.file.filename,
            categories: [req.body.categories], // Assuming a single category for now
            tags: tagsArray
        });
        user.posts.push(post._id);
        await user.save();
        res.redirect('/profile');
    } catch (error) {
        console.error('Error creating post:', error);
        req.flash('error', 'Failed to create post.');
        res.redirect('/add');
    }
});

// Route for login page
router.get('/login', (req, res) => {
    res.render('index');
});

// Route for uploading profile picture
router.post('/fileupload', isLoggedIn, upload.single("image"), async (req, res) => {
    try {
        const user = await User.findOne({ username: req.session.passport.user });
        user.profileImage = req.file.filename;
        await user.save();
        res.redirect('/profile');
    } catch (error) {
        console.error('Error uploading image:', error);
        req.flash('error', 'Failed to upload profile picture.');
        res.redirect('/profile');
    }
});

// Registration route
router.post('/register', async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            req.flash('error', 'Username or email already exists. Please choose different credentials.');
            return res.redirect('/register');
        }

        // Create a new user
        const newUser = new User({ name, username, email });
        User.register(newUser, password, (err) => {
            if (err) {
                console.error('Registration error:', err);
                req.flash('error', 'Failed to register user.');
                return res.redirect('/register');
            }
            passport.authenticate('local')(req, res, () => {
                res.redirect('/profile');
            });
        });
    } catch (error) {
        console.error('Error during user registration:', error);
        req.flash('error', 'An error occurred during user registration.');
        res.redirect('/register');
    }
});

// Route for user login
// 🚀 Buckle up! We're about to authenticate like a pro!
router.post('/login', passport.authenticate('local', {
    // If things go south, back to square one!
    failureRedirect: '/',
    // Flash those error messages like a disco ball!
    failureFlash: true
}), (req, res) => {
    // And off we go to the magical profile land!
    res.redirect('/profile');
});


// Route for user logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/'); // Redirecting to homepage after logout
    });
});

module.exports = router; // Exporting the router
