var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser('Melocotón Rojo'));
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res, next){
  // guardar ruta de vuelta login/logout
  if (!req.path.match(/\/login|\/logout/)){
    req.session.redir = req.path;
  }
  // hacer visible la sesión
  res.locals.session = req.session;
  next();
});

// Control de expiración de tiempo de sesión
// La sesión se define por la existencia de req.session.user
// Si pasan más de 2*60000 milisegundos desde la ultima vez, entonces
// hacer logout y volver a path anterior a login
app.use(function (req, res, next){
  if (req.session.user) {
    var tiempo = 0;
    if (req.session.tiempo) {tiempo = new Date - req.session.tiempo;}
    req.session.tiempo = new Date - 0;
    if (tiempo > 120000){
      delete req.session.tiempo;
      delete req.session.user;
      res.redirect(req.session.redir.toString());
    } else next(); // continuar
  } else next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        errors: []        
    });
});


module.exports = app;
