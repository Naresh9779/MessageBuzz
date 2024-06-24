const express = require('express');
const userRouter=require('../routes/userRoutes')
const chatRouter=require('../routes/chatRoutes')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path=require('path');
const viewRouter=require('../routes/viewRouter');
const { Http2ServerRequest } = require('http2');
const globalErrorHandler = require('../controllers/errorController');
const AppError=require('../utils/appError')

const rateLimiter=require('express-rate-limit');
const helmet=require('helmet');
const mongoSanitizer = require('express-mongo-sanitize');
const xss=require('xss-clean');
const hpp=require('hpp');
const compression=require('compression');

const allowedOrigins = ['https://netlify-deploy--messagebuzz.netlify.app/'];
const app = express();
app.use(bodyParser.json()); 
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));
app.set('view engine', 'pug');

//Used To Sanitize Malicious Mongo Query
app.use(mongoSanitizer());

// used To Avaoid Malicious Html Data
app.use(xss());
app.use(helmet());
app.use(hpp());
app.use(compression());
app.use(express.json({limit:'10 kb' }));
app.use(cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not ' +
          'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true
  }));

// const limiter=rateLimiter({
//     windowMs: 60*60 * 1000,
//     max: 1000,
//     message: "You have exceeded your 1000 requests per hour limit."
    
//   });
  
//   app.use('/api',limiter);


app.set('views',path.join('views'));
app.use('/api/v1/chat',chatRouter);

 app.use('/api/v1/user',userRouter);
app.use('/',viewRouter);
// app.get('/', function(req, res){
//     res.render('signup');
//   });




app.all('*',(req,res,next)=>{

    next(new AppError(`Not Found ${req.originalUrl}`) );
    });
    app.use(globalErrorHandler);

module.exports =app;