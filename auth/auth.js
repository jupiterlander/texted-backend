const bcrypt = require('bcryptjs');
const saltRounds = 10;

const authUser = async function auth(username, password, db) {
    const user = await db.getUser(username);

    if (!user) {
        return {msg: "Username not found!", user: null};
    }

    const result = await bcrypt.compare(password, user.profile.password);

    if (!result) {
        return {msg: "Password incorrect!", user: null};
    }

    return  {msg: "Password correct!", user: user.profile.username};
};


const passwordHash = async (password) => {
    return await bcrypt.hash(password, saltRounds);
};

module.exports = { authUser, passwordHash };
