const jwt = require('jsonwebtoken');
const config = require("../config/config");


module.exports = {
    sign(info) {
        return jwt.sign(JSON.stringify(info), config.JWT_SECRET);
    },
    verify(token) {
        return jwt.verify(token, config.JWT_SECRET);
    }
}

