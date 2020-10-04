const mongoose = require('mongoose')
const Schema = mongoose.Schema;
var Dishes = require('./dishes')

var favoriteSchema = new Schema({
    dishes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Dishes'
    }],
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})
//module.exports = favoriteSchema;
var Favorites = mongoose.model('Favorites', favoriteSchema);

module.exports = Favorites;