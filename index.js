const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const {isAuthorized} = require('./config/authCheck');
const bodyParser = require("body-parser");
const convertapi = require('convertapi')('3CVROT6hAnNl3ri3');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const {Configuration, OpenAIApi} = require('openai');
const QuickChart = require('quickchart-js');
const axios = require('axios');
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

    convertapi.convert('pdf', { File: fileUrl })
    .then(function(result) {
      // get converted file url
      result.files.forEach(async file => {
        console.log(file.url)
        axios.get(`https://api.ocr.space/parse/imageurl?apikey=K84999666688957&url=${file.url}`)
        .then(resp => {
            console.log(resp.data)
        }).catch(err => {
            console.log(err)
        })
      });
    })
    .catch(function(e) {
      console.error(e.toString());
    });

    res.redirect('/uploaded')
});

app.get('/uploaded', async (req,res)=>{
    res.send('uploaded')
})

const client = new textToSpeech.TextToSpeechClient();

app.get('/tts', async (req,res)=>{
    const text = "Hello Oorjit! How are you doing? I hope you are fine."

    const request = {
        input: {text: text},
        // Select the language and SSML voice gender (optional)
        voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
        // select the type of audio encoding
        audioConfig: {audioEncoding: 'MP3'},
      };

      const [response] = await client.synthesizeSpeech(request);
      // Write the binary audio content to a local file
      const writeFile = util.promisify(fs.writeFile);
      await writeFile('output.mp3', response.audioContent, 'binary');
      console.log('Audio content written to file: output.mp3');
})

// ChatGPT Configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration);

app.get('/ttc', (req, res) => {

    const prompt = `Provide a bar graph showing variation in GDP of 5 real Asian Countries. Give it in a format that can be sent to Quickchart API. Format the JSON such that it can be parsed.`

    openai.createCompletion({
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 3000,
        temperature: 0
    }).then(response => {
        // console.log(response.data.choices[0].text)
        data = JSON.parse(response.data.choices[0].text)
        const myChart = new QuickChart();
        myChart
        .setConfig(data)
        .setWidth(800)
        .setHeight(400)
        .setBackgroundColor('transparent');

        // Print the chart URL
        console.log(myChart.getUrl());
        res.send('done')
    }).catch(err => {
        console.log(err)
    })
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log(`Server is running on the port ${PORT}`);
})