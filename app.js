var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db=require('./config/connection')
var session=require('express-session')
var Cors = require('cors')


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var hbs=require('express-handlebars');
const helpers = require('template-helpers')();
var fileUpload = require('express-fileupload')
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const exhbs= hbs.create({
  extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/',


  helpers:{
    iff:function (a,b,options){
     
      a=a.toString();
      b=b.toString();
      
      if ( a === b ){
       
        return "<h2>"+ options.fn({status:true}) +"</h2>"
      }else{
        
        
      }
    }
  }

})


app.engine('hbs',exhbs.engine)
app.use(Cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())
app.use(session({secret:"Key",cookie:{maxAge:600000}}))
db.connect((err)=>{
  if(err) console.log("connection error",+err)
  else console.log("connected")
})
app.use('/',userRouter);
app.use('/admin', adminRouter);






// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
