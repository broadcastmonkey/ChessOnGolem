require("dotenv").config();
console.log("key " + process.env.JWT_PRIVATE_KEY);
const users = new (require("./users-manager/users-manager"))();

logObject = (obj) => JSON.stringify(obj, null, 4);

let user1 = users.addUser("pawelek");
console.log(`user1 : ${logObject(user1)}`);
