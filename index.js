import session from 'express-session';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import errorhandler from 'errorhandler';
import methodOverride from 'method-override';
import morgan from 'morgan';
import routes from './routes';
import {} from './models/User';
import {} from 'dotenv/config';
import {} from './config/passport';

const isProduction = process.env.NODE_ENV === 'production';

// Create global app object
const app = express();

// Normal express config defaults
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(`${__dirname}/public`));
app.use(
  session({
    secret: 'authorshaven',
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  }),
);

if (!isProduction) {
  app.use(errorhandler());
}
app.use(routes);

// / catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});
/* eslint-disable */
// error handlers
// development error handler
// will print stacktrace
if (!isProduction) {
  app.use((err, req, res, next) => {
    // do not log errors on test environment, 
    // returning it is good enough
    if (process.env.NODE_ENV !== 'test') console.log(err.stack);
    return res.status(err.status || 500)
      .json({
        errors: {
          message: err.message,
          error: err,
        },
      });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});


// finally, let's start our server...
// do not open a port on test environment,
// this will be taken care of by mocha
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Listening on port ${server.address().port}`);
  });
}
/* eslint-disable */
// export express app for testing
module.exports = app;
