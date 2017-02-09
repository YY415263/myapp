var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var session = require('express-session');
var routes = require('./routes');
var messages = require('./lib/messages');
var user = require('./lib/middleware/user');
var validate = require('./lib/middleware/validate');
var page = require('./lib/middleware/page');
var Entry = require('./lib/entry');
var api = require('./routes/api');


var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: "kvkenssecret",
  key: "kvkenskey",
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//超时时间
  resave: false,
  saveUninitialized: true
}));


app.use('/api', api.auth);
app.use(user);
app.use(messages);


var register = require('./routes/register');
var index = require('./routes/index');
var login = require('./routes/login');
var entries = require('./routes/entries');


app.get('/register', register.form);
app.post('/register', multipartMiddleware,register.submit);
app.get('/login', login.form);
app.post('/login', multipartMiddleware, login.submit);
app.get('/logout', login.logout);
app.get('/post', entries.form);
app.post('/post',
    multipartMiddleware,
    validate.required('entry[title]'),
    validate.lengthAbove('entry[title]', 4),
    entries.submit);
app.get('/:page?', page(Entry.count, 5), entries.list);
app.get('/api/user/:id', api.user);


app.post('/api/entry', entries.submit);
app.get('/api/entries/:page?', page(Entry.count), api.entries);



app.use(routes.notfound);
app.use(routes.error);


// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  var err = new Error('Not Found');
//  err.status = 404;
//  next(err);
//});
//
//// error handler
//app.use(function(err, req, res, next) {
//  // set locals, only providing error in development
//  res.locals.message = err.message;
//  res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//  // render the error page
//  res.status(err.status || 500);
//  res.render('error');
//});

module.exports = app;

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});