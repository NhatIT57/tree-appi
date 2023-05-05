const md5 = require('md5');
// const MD5 = require('md5.js')

const hash = (plain) => {
    return md5(plain);
};
module.exports = {
    encryptPassword(password) {
        const time = new Date().getTime();
        const salt = hash(time.toString());
        const hashPassword = hash(password + salt);
        return { salt, hashPassword };
    },

    comparePassword(hashPassword, salt, password) {
        const toCompareHashPassword = hash(password + salt);
        return hashPassword === toCompareHashPassword;
    }
}



