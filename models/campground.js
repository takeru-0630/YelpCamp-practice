const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ] //和評論進行連接
});

CampgroundSchema.post('findOneAndDelete',async function(doc){
    if (doc){
        await Review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        })
    }
    // console.log('deleteeeeeeeeee');
}) //mongoose middleware

module.exports = mongoose.model('Campground', CampgroundSchema);