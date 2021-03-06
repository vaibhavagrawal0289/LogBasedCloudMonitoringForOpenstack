var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var index = require('./routes/index');
var users = require('./routes/users');
//var cron=require('./routes/cron')
var trace=require('./routes/Trace');

//var graph=require('./routes/chart');

var login=require('./routes/login');

var http = require('http');

var app = express();

var forNova=require('./routes/nova');

var forSearch=require('./routes/search');

var forNeutron=require('./routes/neutron');

var forHome=require('./routes/home');

var forCinder=require('./routes/cinder');

var forHorizon=require('./routes/horizon');

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
  secret: 'sjsumaster',
  resave: true,
  saveUninitialized: true
}));

app.use('/', index);
app.use('/users', users);

app.get('/nova', forNova.nova);
app.get('/fetchnova', forNova.fetchNovaLogs);

app.get('/neutron', forNeutron.neutron);
app.get('/fetchneutron', forNeutron.fetchNeutronLogs);

app.get('/cinder', forCinder.cinder);
app.get('/fetchcinder', forCinder.fetchCinderLogs);

app.get('/home', forHome.home);
app.get('/fetchInfoForHomePage', forHome.fetchInfoForHomePage);

app.get('/searchlog', forSearch.search);
app.post('/search', forSearch.fetchNeutronLogs);

app.get('/ip', forHorizon.ip);
app.get('/fetchHorizonip', forHorizon.fetchHorizonip);

//app.get('/chart',graph.graphs)
app.post('/trace', trace.fetchNeutronLogs);
app.get('/tracelog',trace.traceLog);

app.get('/login',login.login);
app.post('/checkLogin',login.checkLogin);
app.get('/logout', login.logout);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


http.createServer(app).listen(3000, function(){
    console.log('Express server listening on port ' + 3000);
});
