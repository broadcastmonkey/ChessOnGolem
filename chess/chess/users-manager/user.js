const jwt = require("jsonwebtoken");

class User {
    constructor(id, login) {
        if (id !== undefined && login !== undefined) {
            this.login = login;
            this.password = this.generatePassword();
            this.id = id;
            this.jwt = this.generateJWT();
        }
    }
    load = (obj) => {
        this.login = obj.login;
        this.password = obj.password;
        this.id = obj.id;
        this.jwt = obj.jwt;
    };
    getObject = () => {
        return { login: this.login, password: this.password, id: this.id, jwt: this.jwt };
    };
    generateJWT = () => {
        const token = jwt.sign(
            {
                login: this.login,
                id: this.id,
            },
            process.env.JWT_PRIVATE_KEY,
        );
        return token;
    };
    generatePassword = () => {
        return "123";
    };
}

module.exports = User;
