const User = require("./user");
const events = require("../sockets/event-emitter");
const ChessTempPathHelper = require("../helpers/chess-temp-path-helper");
const fs = require("fs");
class UsersManager {
    constructor() {
        this.currentUserId = 0;
        this.users = [];
        events.addListener("register_user", this.handleRegisterUser);
        events.addListener("login_user", this.handleLoginUser);
    }

    handleLoginUser = (data) => {
        console.log(`trying to login user ${data.login}`);
        const user = this.getUser(data.login);
        if (user) {
            if (data.password === user.password) {
                console.log(`success`);
                data.socket.emit("loginUser", {
                    status: 200,
                    msg: "login ok",
                    jwt: user.jwt,
                });
                return;
            } else {
                console.log(`wrong passphrase`);
            }
        } else {
            console.log(`wrong login`);
        }

        data.socket.emit("loginUser", {
            status: 401,
            login: data.login,
            msg: `wrong login (and/or) passphrase`,
        });
    };
    handleRegisterUser = (data) => {
        console.log(`trying to register user ${data.login}`);
        if (this.getUser(data.login) === undefined) {
            console.log(`success`);
            const newUser = this.addUser(data.login);
            data.socket.emit("registerUser", {
                status: 201,
                msg: "profile created",
                jwt: newUser.jwt,
            });
            this.save();
        } else {
            console.log(`already exists`);
            data.socket.emit("registerUser", {
                status: 409,
                login: data.login,
                msg: `user with nick: ${data.login} already exists`,
            });
        }
    };

    save = () => {
        const paths = new ChessTempPathHelper(0, 0);

        if (!fs.existsSync(paths.UsersFolder)) {
            fs.mkdirSync(paths.UsersFolder, { recursive: true });
        }
        const usersToSave = this.users.map((x) => x.getObject());
        let data = JSON.stringify(usersToSave);
        fs.writeFileSync(paths.UsersFilePath, data);
        console.log(`users saved.`);
    };

    getUser = (nick) => {
        return this.users.find((x) => x.login === nick);
    };

    isNickAllowed = (nick) => {
        if (nick === undefined) return false;
        if (this.getUser(nick) !== undefined) return false;
        return true;
    };
    addUser = (nick) => {
        if (this.isNickAllowed(nick) === true) {
            const newUser = new User(this.currentUserId++, nick);
            this.users.push(newUser);
            return newUser;
        }
        return undefined;
    };

    load = () => {
        console.log("loading users from disk...");
        const paths = new ChessTempPathHelper(0, 0);
        if (fs.existsSync(paths.UsersFolder)) {
            if (fs.existsSync(paths.UsersFilePath)) {
                let rawdata = fs.readFileSync(paths.UsersFilePath);
                const data = JSON.parse(rawdata);

                data.forEach((user) => {
                    const newUser = new User();
                    newUser.load(user);
                    this.users.push(newUser);
                    this.currentUserId = Math.max(this.currentUserId, newUser.id + 1);
                });
                console.log(`loaded ${this.users.length} users`);
                return;
            }
        } else {
            console.log("there is no user file");
        }
    };

    save() {}
}

module.exports = UsersManager;
