const mongoose = require('mongoose');

const CourseSchema = mongoose.Schema({
    names: [{
        language: String,
        name: String
    }],
    descriptions: [{
        language: String,
        description: String
    }],
    images: [String],
    duration: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    places: {
        type: Number,
    },
    rating: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    deletedAt: {
        type: Date
    }
});

const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;
