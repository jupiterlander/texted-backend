const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'min-hatt-den-har-tre-kanter';

const createToken = function createToken(payload) {
    return jwt.sign(payload, secret, { expiresIn: '1h'});
};

module.exports = { createToken };
