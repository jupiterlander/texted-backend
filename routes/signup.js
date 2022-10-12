const express = require('express');
const jwtToken  = require('../auth/jwtToken');
const { passwordHash } = require('../auth/auth');
const router = express.Router();


router.post('/signup', async function(req, res) {
    console.log("req.body", req.body);

    try {
        req.body.password = await passwordHash(req.body.password);
        const result = await req.app.get('db').insertUser(req.body);

        if (!result.acknowledged) {
            res.status(500).json({ msg: "Something went wrong..." });
        }

        return res.status(201).json({
            "access_token": jwtToken.createToken({username: req.body.username}),
            "token_type": "jwt",
            "expires_in": null,
            "refresh_token": null,
        });
    } catch (e) {
        console.log("signup error: ", e);
        if (e.code === 11000) {
            res.status(403).json({msg: "User already exists!"});
        } else {
            res.status(500).json({msg: "Something went wrong..."});
        }
    }
});

module.exports = router;
