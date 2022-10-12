const express = require('express');
const { authUser } = require('../auth/auth');
const jwtToken = require('../auth/jwtToken');
const router = express.Router();


router.post('/login', async function (req, res) {
    //checks if already "loggedin" with jwt in req
    if (req.user) {
        return res.json({user: req.user});//fixa
    }

    try {
        const result = await authUser(req.body.username, req.body.password, req.app.get('db'));

        if (!result.user) {
            return res.status(404).json({"msg": result.msg});
        }
        return res.json({
            "access_token": jwtToken.createToken({username: req.body.username}),
            "token_type": "jwt",
            "expires_in": null,
            "refresh_token": null,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

module.exports = router;
