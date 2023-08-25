const router = require('express').Router();
const { request } = require('express');
const Users = require('../models/Users');
require('dotenv').config()

const redirectUri = process.env.REDIRECT_URI

router.post('/', (req, res) => {
    const upers = req.body
    let a = 0;
    let t = 0;
    let v = 0;
    for (const key in upers) {
        switch (upers[key]) {
            case 'a':
                a += 1
                break;
            case 't':
                t += 1
                break;
            case 'v':
                v += 1
                break;
            default:
                break;
        }
    }
    console.log(a, t, v);
    res.render('results', { a, t, v, total: a+t+v})
})

module.exports = router;