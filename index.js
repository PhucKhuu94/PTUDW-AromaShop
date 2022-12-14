const express = require('express');
const app = express();

// Set Public Static folder
app.use(express.static(__dirname + '/public'));

// Use view engine express-handlebars
const expressHbs = require('express-handlebars');
const  helper = require('./controllers/helper');
const paginateHelper = require('express-handlebars-paginate');
const hbs = expressHbs.create({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true
    },
    helpers: {
        createStarList: helper.createStarList,
        createStar: helper.createStar,
        createPagination: paginateHelper.createPagination,
    }
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// Body parser
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Use Cookie-parser
let cookieParser = require('cookie-parser');
app.use(cookieParser());

// Use Session
let session = require('express-session');
app.use(session({
    cookie: { httpOnly: true, maxAge: null },
    secret: 'S3cret',
    resave: false,
    saveUninitialized: false,
}));

// Use Cart controller
let Cart = require('./controllers/cartController');
app.use((req, res, next) => {
    let cart = new Cart(req.session.cart ? req.session.cart : {});
    req.session.cart = cart;
    res.locals.totalQuantity = cart.totalQuantity;

    res.locals.fullname = req.session.user ? req.session.user.fullname : '';
    res.locals.isLoggedIn = req.session.user ? true : false;
    next();
});

app.use('/', require('./routes/indexRouter'));
app.use('/products', require('./routes/productRouter'));
app.use('/cart', require('./routes/cartRouter'));
app.use('/comments', require('./routes/commentRouter'));
app.use('/reviews', require('./routes/reviewRouter'));
app.use('/users', require('./routes/userRouter'));

app.get('/:page', (req, res) => {
    let banners = {
        contact: 'Contact Us',
        "tracking-order": 'Tracking your order',
        blog: 'Our Blog',
        "single-blog": 'Your blog',
    };
    let page = req.params.page;
    res.render(page, { 
        banner: banners[page],
        active: { [page]: true },
    });
});

app.get('/sync', (req, res) => {
    let models = require('./models');
    models.sequelize.sync()
    .then(() => {
        res.send('database sync completed');
    });
});

// Set Server Port & Start Server
app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), () => {
    console.log(`Server is listening on port ${app.get('port')}`);
});