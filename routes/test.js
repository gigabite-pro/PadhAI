const router = require('express').Router();
const { request } = require('express');
const Users = require('../models/Users');
const {isAuthorized} = require('../config/authCheck');
require('dotenv').config()

const redirectUri = process.env.REDIRECT_URI

router.post('/', isAuthorized, async (req, res) => {
    const upers = req.body
    let a = 0;
    let t = 0;
    let v = 0;
    let type;
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

    if ((v >= a) && (v >= t)) {
        type = "visual"
    } else if ((t >= a) && (t >= v)) {
        type = "tactile"
    } else {
        type = "auditory"
    }

    const uid = req.session.user._id
    const user = await Users.findOne( {_id: uid} )

    user.personality = type
    await user.save()

    res.render('results', { a, t, v, total: a+t+v})
})

module.exports = router;