const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    podcasts: [{
        trackName: String,
        artistName: String,
        primaryGenreName: String,
        artworkUrl600: String,
        releaseDate: Date,
        collectionViewUrl: String
    }]
});

const Podcasts = mongoose.model('Podcasts', podcastSchema);

module.exports = Podcasts;