const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const {isAuthorized} = require('./config/authCheck');
const bodyParser = require("body-parser");
var convertapi = require('convertapi')('3CVROT6hAnNl3ri3');
const authRoute = require('./routes/auth');
const testRoute = require('./routes/test');
require('dotenv').config();
const axios = require('axios');

// Middlewares
app.use(express.static(__dirname + '/public'));
app.set('views', (__dirname + '/views'))
app.set('view engine', 'ejs');
app.use(
    session({
        secret : process.env.SESSION_SECRET,
        cookie : {
            maxAge : 60000 * 60 * 24
        },
        saveUninitialized : true,
        resave : false
    })
)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());

// DB connection
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI,{ 
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err))

//routes
app.use('/auth', authRoute);
app.use('/test', testRoute)

app.get('/', (req,res)=>{
    res.render('index')
})

app.get('/upload', (req,res)=>{
    res.render('upload')
})

app.get('/test', isAuthorized, (req,res)=>{
    res.render('test')
})


app.post('/uploadFile', (req,res)=>{
    const fileUrl = req.body.fileUrl
    console.log(fileUrl)

    convertapi.convert('jpg', { File: fileUrl })
    .then(function(result) {
      // get converted file url
      result.files.forEach(file => {
        console.log(file.url)
      });
    })
    .catch(function(e) {
      console.error(e.toString());
    });

    res.redirect('/uploaded')
});

app.get('/uploaded', async (req,res)=>{
    res.send('uploaded')
});

app.get('/dalle', async (req, res) => {
    await axios.post('https://api.openai.com/v1/images/generations', {
        "prompt": "Design a 'Word Tree' where each branch blossoms with words related to a different story",
        "n": 1,
        "size": "1024x1024"
    }, {
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
        }
    }).then(response => {
        console.log(response.data);
        res.send(response.data.data[0].url);
    }).catch(err => {
        console.log(err);
        res.send(err);
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log(`Server is running on the port ${PORT}`);
})