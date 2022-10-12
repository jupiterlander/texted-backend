const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'min-hatt-den-har-tre-kanter';

const checkToken = function checkToken(req, res, next) {
    const token = req.headers['x-access-token'];

    try {
        token && jwt.verify(token, secret, function(err, decoded) {
            if (err) {
                // send error response
                console.log("Token not valid!", err.name, err.message);
            } else {
                console.log("token valid?", decoded);
                req.user = {
                    username: decoded.username,
                };
            }
        });
    } catch (e) {
        // do nothin
    } finally {
        next();
    }
};

const verifyToken = function verifyToken(token) {
    console.log(token);
    return jwt.verify(token, secret, function(err, decoded) {
        if (err) {
            console.log("token not vcalid:", err, "decoded: ", decoded);
            return {msg: "Token not valid!", err: err, user: null};
        }
        console.log("token valid2", decoded);
        return {msg: "Token valid!", err: false, user: {username: decoded.username}};
    });
};

const getPayload = async function getPayload(token) {
    return  jwt.verify(token, secret, function(err, decoded) {
        if (err) {
            console.log(err);
            return null;
        }
        console.log("token valid3", decoded);
        return { payload: decoded.username };
    });
};

module.exports = { checkToken, verifyToken, getPayload };
