let express = require('express');
let cors = require('cors');
let helmet = require('helmet');
let morgan = require('morgan');
let bodyParser = require('body-parser');
let exphbs = require('express-handlebars');
let port = process.env.PORT || 3000;

let Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://ea7880986179406995d6734c0a4b5bf2@sentry.io/1353226' });

let stats = require('./stats');

let app = express();

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use(express.static('assets'));

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.get('/sentry/test', (req, res) => {
    throw new Error('Broke! This is a test!');
});

app.get('/api/stats', async (req, res) => {

    let s;
    try {
        s = await stats();
    } catch (error) {
        console.error(error);
    }

    res.status(200).json(s);
});

app.get('/', async (req, res) => {

    let s;
    try {
        s = await stats();
    } catch (error) {
        console.error(error);
    }

    res.render('index', {
        days: s.timeStats.days,
        hours: s.timeStats.hours,
        minutes: s.timeStats.minutes,
        seconds: s.timeStats.seconds,
        averageDays: s.timeStats.averageBreakdown.days,
        averageHours: s.timeStats.averageBreakdown.hours,
        averageMinutes: s.timeStats.averageBreakdown.minutes,
        averageSeconds: s.timeStats.averageBreakdown.seconds,
        breakdown: JSON.stringify(s.timeStats.breakdown, null, 2),
        averageBreakdown: JSON.stringify(s.timeStats.averageBreakdown, null, 2)
    });
});

// The error handler must be before any other error middleware
app.use(Sentry.Handlers.errorHandler());

app.use((err, req, res, next) => {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    res.end(res.sentry + '\n');
});

app.listen(port, () => console.log('Listening on port: ' + port));