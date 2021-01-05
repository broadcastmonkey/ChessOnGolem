## Chess on Golem Viewer

### Summary

This project was created as an entry to Golem Hackathon 12/2020.

It's purpose is to show that any state based game / problem can be run in Golem Network and solved interactively by provider nodes.

This particular example shows classical chessgame played by two AI players that facilitate golem network for computing.
Whole game is managed by Node.js server which distributes computing tasks across Golem Network providers' network.
Each move request is put into Golem Market and calculated by provider that puts best offer.
To show how computing power could affect outcome of the game each player is allowed to calculate next move with particular depth. (With enough provider nodes in network that could be achieved without forcing one of players to ask for computations with lower depth than opponent)

This particulat project is designed as a GUI to backend project running Golem Network.

### DEMO's

Demo v0.3
https://www.youtube.com/watch?v=Wp_lJEeN7UA&feature=youtu.be&ab_channel=Pawe%C5%82Burgchardt

Demo v0.2
https://www.youtube.com/watch?v=C65uTAZAsRA&list=UUxg1Vq50vwy7Pm3kFwb0ZQg&index=2&ab_channel=Pawe%C5%82Burgchardt

Demo v0.1 (problem with some providers' payments ==> invoices that are way too huge)
https://www.youtube.com/watch?v=cTD0zq7jURM&list=UUxg1Vq50vwy7Pm3kFwb0ZQg&index=3&ab_channel=Pawe%C5%82Burgchardt

### Subprojects used in development

#### Node Chess App

Node.js Server that can be run on linux or windows machines that is responsible for handling game and requesting Golem Network for next moves for each AI player.

Is used also as backend server for GUI App that displayes chess game in real time with some statistics regarding provider nodes work.
(ChessOnGolemViewer => https://github.com/broadcastmonkey/ChessOnGolemViewer)

#### Chess on Golem Viewer

https://github.com/broadcastmonkey/ChessOnGolemViewer

React application that serves as GUI for displaying chess game progress for Chess on Golem.

It displays

### Used framewroks / libraries

- Node.js / udner MIT license
- React / under MIT license
- Bootstrap / under MIT license
- Chess.js / under BSD license
- Chessboard.jsx / under MIT license
- Socket.io / under MIT license
- stockfish.js / under GNU General Public License
