const express = require('express');
const router = express.Router();


router.get('/loggedin', async function (req, res) {
    //checks if already "loggedin" with jwt in req
    if (req.user) {
        return res.status(200).json({ user: req.user });
    }

    return res.status(403).send();
});

module.exports = router;
