const express = require('express');
const catchAsync = require('../utils/catchAsync');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body; //從req裡面拆解出需要的東西
        const user = new User({ email, username }); //將email和username依照Schema格式儲存
        const registerdUser = await User.register(user, password);
        req.login(registerdUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to yelp camp');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
    // console.log(registerdUser);
}));

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds'; //前半在middleware 登入後轉到登入前頁面 要加上 keepSessionInfo:true 否則抓不到
    delete req.session.returnTo; //用完後刪除
    res.redirect(redirectUrl);
})

router.get('/logout', async (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
});

module.exports = router;