const User = require("./user");
const events = require("../sockets/event-emitter");
class UsersManager {
    constructor() {
        this.currentUserId = 0;
        this.users = [];
        events.addListener("register_user", this.handleRegisterUser);
    }

    handleRegisterUser = (data) => {
        console.log(`trying to register user ${data.login}`);
        if (this.getUser(data.login) === undefined) {
            const newUser = addUser(data.login);
            data.socket.emit("registerUser", { status: 201, msg: "profile created" });
            this.save();
        } else {
            data.socket.emit("registerUser", {
                status: 409,
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
        return this.users.find((x) => x.name === nick);
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
                let rawdata = fs.readFileSync(this.paths.GameFile);
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
