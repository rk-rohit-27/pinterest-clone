const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
require('dotenv').config();
const Category = require('./categorymodel')

const uri = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^\S+@\S+\.\S+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    profileImage: {
        type: String,
        default: 'default-profile.png'
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
}, { timestamps: true });

userSchema.plugin(plm); // Add passport-local-mongoose plugin for username/password

userSchema.methods.follow = async function(userId) {
    if (this.following.includes(userId) || this._id.equals(userId)) {
        console.log("Cannot follow oneself or already following.");
        return; // Prevent following oneself or duplicate follows
    }

    const userToFollow = await this.model('User').findById(userId);
    if (!userToFollow) {
        console.log("User to follow not found.");
        return; // Handle non-existing user
    }

    this.following.push(userId);
    await this.save();

    userToFollow.followers.push(this._id);
    await userToFollow.save();
};


userSchema.methods.unfollow = async function(userId) {
    const userToUnfollow = await this.model('User').findById(userId);
    if (!userToUnfollow) {
        console.log("User to unfollow not found.");
        return; // Handle non-existing user
    }

    this.following.pull(userId);
    await this.save();

    userToUnfollow.followers.pull(this._id);
    await userToUnfollow.save();
};


module.exports = mongoose.model('User', userSchema);



// Function to seed categories
async function seedCategories() {
    const categories = [
        'Art',
        'Home Decor',
        'Fashion',
        'Food & Drink',
        'Travel',
        'Health & Fitness',
        'DIY & Crafts',
        'Technology',
        'Photography',
        'Beauty',
        'Weddings',
        'Nature',
        'Education'
    ];

    for (const category of categories) {
        await Category.create({ name: category });
    }

    console.log('Categories seeded successfully');
}

// Connect to MongoDB
mongoose.connect(uri, )
    .then(async () => {
        console.log('MongoDB connected successfully');

        
        // await seedCategories();

        // Start your server or define your routes here
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });