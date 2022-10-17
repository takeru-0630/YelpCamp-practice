const express = require('express');
const router = express.Router({ mergeParams: true }); //加上去才能拿到:id
const catchAsync = require('../utils/catchAsync');
// const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const Campground = require('../models/campground');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');


router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', '成功評論');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;