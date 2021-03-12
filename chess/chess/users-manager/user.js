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
                password: this.password,
                id: this.id,
            },
            process.env.JWT_PRIVATE_KEY,
        );
        return token;
    };
    generatePassword = () => {
        const arr1 = [
            "pink",
            "crimson",
            "red",
            "maroon",
            "brown",
            "mistyrose",
            "salmon",
            "coral",
            "chocolate",
            "orange",
            "gold",
            "ivory",
            "yellow",
            "olive",
            "lawngreen",
            "chartreuse",
            "lime",
            "green",
            "aquamarine",
            "turquoise",
            "azure",
            "cyan",
            "teal",
            "lavender",
            "blue",
            "navy",
            "indigo",
            "darkviolet",
            "plum",
            "magenta",
            "purple",
            "tan",
            "beige",
            "slategray",
            "darkslategray",
            "white",
            "whitesmoke",
            "lightgray",
            "silver",
            "darkgray",
            "gray",
            "dimgray",
            "black",
        ];
        const arr2 = [
            "alligator",
            "alpaca",
            "anaconda",
            "ant",
            "bat",
            "bear",
            "beaver",
            "bedbug",
            "bee",
            "beetle",
            "bird",
            "bison",
            "bobcat",
            "buffalo",
            "butterfly",
            "camel",
            "carp",
            "cat",
            "cheetah",
            "chicken",
            "cobra",
            "cougar",
            "cow",
            "coyote",
            "crab",
            "crane",
            "crocodile",
            "crow",
            "cuckoo",
            "deer",
            "dinosaur",
            "dog",
            "dolphin",
            "donkey",
            "dove",
            "duck",
            "eagle",
            "elephant",
            "emu",
            "falcon",
            "fish",
            "flamingo",
            "fox",
            "frog",
            "goat",
            "gorilla",
            "grasshopper",
            "hamster",
            "hawk",
            "horse",
            "husky",
            "iguana",
            "kangaroo",
            "ladybug",
            "leopard",
            "lion",
            "lizard",
            "lobster",
            "monkey",
            "mouse",
            "octopus",
            "orca",
            "owl",
            "panda",
            "parrot",
            "penguin",
            "pig",
            "rabbit",
            "rat",
            "raven",
            "sheep",
            "shrew",
            "skunk",
            "snail",
            "snake",
            "spider",
            "tiger",
            "whale",
            "wolf",
            "zebra",
        ];
        var item1 = arr1[Math.floor(Math.random() * arr1.length)];
        var item2 = arr2[Math.floor(Math.random() * arr2.length)];
        return item1 + " " + item2;
    };
}

module.exports = User;
