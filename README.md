## Chess on Golem Viewer

### Summary

This project was created as an entry to Golem Hackathon 12/2020.

It's purpose is to show that any state based game / problem can be run in Golem Network and solved interactively by provider nodes.

This particular example shows classical chess game played by two AI players that facilitate golem network for computing.

Whole game is managed by Node.js server which distributes chess computing tasks across Golem Network providers.

Each move request is sent to Golem Market and calculated by provider with best bid.

The aim is to show how computing power may affect the outcome of the game.

Right now the depth is fixed by allowing particular players to calculate moves with specific search depth. In youtube demos white player plays with depth of 17 / 20 and black player plays with depth of 1.

In future with more providers in the Golem Network particular players may parallelize their calculations by using more or less providers to achieve better or worse moves in shorter time. It would also probably impact of final cost of game for each player.

Hybrid strategies might be also used, e.g.: use more computing power at the beginning of the game and less computing power in the endgame.

### DEMO's

Demo v0.3
https://www.youtube.com/watch?v=Wp_lJEeN7UA&feature=youtu.be&ab_channel=Pawe%C5%82Burgchardt

Demo v0.2
https://www.youtube.com/watch?v=C65uTAZAsRA&list=UUxg1Vq50vwy7Pm3kFwb0ZQg&index=2&ab_channel=Pawe%C5%82Burgchardt

Demo v0.1 (problem with some providers' payments ==> invoices that are way too huge)
https://www.youtube.com/watch?v=cTD0zq7jURM&list=UUxg1Vq50vwy7Pm3kFwb0ZQg&index=3&ab_channel=Pawe%C5%82Burgchardt

Presentation:
http://developed.home.pl/chessongolem.pdf

### Subprojects used in development

#### Node Chess App

Node.js Server (can be run on linux or windows machines) that is responsible for handling chess game and requesting Golem Network for aid with calculating next moves for each AI player. Moves are calculated on Node alpine docker image transformed to .gvim with a help of a stockfish.js chess engine.

Node chess app creates a request to golem network for each move that is being performed by AI players. For demo purposes one player asks for best move with depth precision of 20 and the other one uses depth of 1.

This can be changed in chess/index.js on line 32:

moveData.depth = moveData.turnId == "w" ? 20 : 1;

Typical calculation times:\
Depth \
 < 10 => < 1s\
~ 20 => ~ 3s\
~ 30 => ~ 157s

Example of a file with task description that is sent to Golem Providers:

//--------\
hash_00000132_0003\
20\
position fen rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2\
//--------

Line 1 : id of an operation used to distinguish different tasks by chess server.\
Line 2 : contains depth that stockfish.js algorithm needs to consider.\
Line 3: describes current chess game state in fen notation.

Correct output should look similar to this file:

//--------\
bestmove e4d5 ponder g8f6\
exec time:8672.225822\
depth:20\
hash:hash_00000132_0003\
//--------

With lines describing suggested move, calculation time[ms], depth of calculations and operation id.

Node Chess app is also used as backend server for GUI App that displays chess game in real time with some statistics regarding provider nodes work.

Demo of Node Chess app currently runs at http:// 20.52.154.16/3970 on Linux Ubuntu VM in MS Azure cloud.

To run Node Chess app please do the following:

cd chess\
yarn install\
yarn js:chess

Script runs until game is finished, when some calculation fails or timeouts golem network is being asked to perform it again.

Multiple clients can connect to socket.io websocket server and listen for events that describe current game state

Events:
• currentTurnEvent\
• providerFailed\
• computationStarted\
• movesRefreshed\
• gameFinished\
• offersReceived\
• agreementCreated\
• agreementConfirmed\
• computationFinished\
• invoiceReceived\
• moveEvent\
• positionEvent

When client reconnects server sends him automatically current state of the game.

#### Chess on Golem Viewer

React application that serves as GUI for displaying chess game progress for Chess on Golem.

It displays game progress and some interesting stats regarding provider nodes that took part in calculations.

There is live demo available at:
http://chess-on-golem-viewer.herokuapp.com/

If It's not currently running you can request start at pawel.burgchardt [ A-T] gmail.com

You can run it locally by going to chess-viewer folder and executing

npm install\
npm start

You can then open the browser and see the result at http://localhost:3000/

Chess on Golem Viewer connects automatically to node chess app server on 127.0.0.1:3970

To change it please update .env.development file

//------\
REACT_APP_NAME=Chess on Golem 1\
REACT_APP_VERSION=0.0.1\
REACT_APP_SOCKET_SERVER_URL=http://127.0.0.1:3970/ \
REACT_APP_API_URL=http://127.0.0.1:3970/api \
//------

## SET UP

- node 12
- yagna daemon
- run yarn install / yarn js:chess in chess folder
- run npm install / npm start in chess-viewer folder
- enjoy chess game played by two golem AIs at http://localhost:3000/

## Potential growth

- player vs golem mode
- other state based games implemented
- golem network tests for interactive tasks

### Used framewroks / libraries

- Node.js / udner MIT license
- React / under MIT license
- Bootstrap / under MIT license
- Chess.js / under BSD license
- Chessboard.jsx / under MIT license
- Socket.io / under MIT license
- stockfish.js / under GNU General Public License

# License

Project is licensed under GPLv3 license.

# Author

Paweł Burgchardt
