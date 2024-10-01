const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100 // Limit the title length
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500 // Limit the description length
  },
  image: {
    type: String,
    required: true,
    default: '/images/uploads/default.png',
    validate: {
      validator: function (v) {
        return /^\/images\/uploads\/.+\.(jpeg|jpg|png|gif|webp)$/.test(v) || 
               /^[a-f0-9-]{36}\.(jpeg|jpg|png|gif|webp)$/.test(v) ||
               /^(https?:\/\/).+\.(jpeg|jpg|png|gif|webp)$/.test(v);
      },
      message: props => `${props.value} is not a valid image URL!`
    }
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, { timestamps: true }); // Adds createdAt and updatedAt fields

module.exports = mongoose.model('Post', postSchema);
