const jwt = require("jsonwebtoken");

class User {
    constructor(id, userName) {
        if (id !== undefined && userName !== undefined) {
            this.name = userName;
            this.password = this.generatePassword();
            this.id = id;
            this.jwt = this.generateJWT();
        }
    }
    load = (obj) => {
        this.name = obj.name;
        this.password = obj.password;
        this.id = obj.id;
        this.jwt = obj.jwt;
    };
    getObject = () => {
        return { name: this.name, password: this.password, id: this.id, jwt: this.jwt };
    };
    generateJWT = () => {
        const token = jwt.sign(
            {
                name: this.name,
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
