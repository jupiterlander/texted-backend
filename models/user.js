import { connect } from "../database/dbHandler";


function User(data) {
    this.userName = data.userName;
    this.email = data.email;
    this.password = data.password;
    this.docs = data.docs || [];
}

User.storeUser = function() {
    connect.store(
        {
            userName: this.userName,
            amail: this.email,
            password: this.password,
            docs: this.docs
        });
};



module.exports = User;
