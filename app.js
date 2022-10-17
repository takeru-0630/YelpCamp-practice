const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

// const Campground = require('./models/campground');
// const { setDefaultResultOrder } = require('dns');
// const Review = require('./models/review');
// const Joi = require('joi');
// const { campgroundSchema, reviewSchema } = require('./views/schemas');
// const catchAsync = require('./utils/catchAsync');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true, 
    useUnifiedTopology: true,
    // useFindAndModify:false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); //解析POST 否則req.body會是空值
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!', //recommand 128 bytes random string
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: 1000 * 60 * 60 * 24 * 7, //IE專用 現在不用Date.now()了
        maxAge: 1000 * 60 * 60 * 24 * 7 //其他瀏覽器使用
    }
}
app.use(session(sessionConfig));
app.use(flash());

//以下都是passport相關
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//passport

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes); //router
app.use('/campgrounds/:id/reviews', reviewRoutes);


app.get('/', (req, res) => {
    res.render('home')
})


app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404)); //運用ExpressError丟出err
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err; //ExpressError丟來的err
    if (!err.message) err.message = 'Oh no something went wrong';
    res.status(statusCode).render('error', { err }); //渲染error.ejs
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
});