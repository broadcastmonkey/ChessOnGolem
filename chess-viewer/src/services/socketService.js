import io from "socket.io-client";

const ENDPOINT = process.env.REACT_APP_SOCKET_SERVER_URL;
console.log("end point : " + ENDPOINT);
const socket = io(ENDPOINT);

export default socket;
