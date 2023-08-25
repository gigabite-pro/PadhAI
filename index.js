const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const {isAuthorized} = require('./config/authCheck');
const authRoute = require('./routes/auth');
require('dotenv').config();

// Middlewares
app.set('views', (__dirname + '/views'))
app.set('view engine', 'ejs');
app.use(
    session({
        secret : 'yoyohoneysingh',
        cookie : {
            maxAge : 60000 * 60 * 24
        },
        saveUninitialized : true,
        resave : false
    })
)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// DB connection
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI,{ 
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err))

//routes
app.use('/auth', authRoute);

app.get('/', (req,res)=>{
    res.send('Go to /auth/login')
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log(`Server is running on the port ${PORT}`);
})