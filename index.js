import express from 'express';
import cors from 'cors';

import handleJoin from './join.js';
import handleBoard from './board.js';
import submit from './submit.js';
import GameManager from './games.js';

const { Express, Request, Response } = express;

const app = express();

app.use(cors());

app.get('/join', (req, res) => {
    handleJoin(req, res);
})

app.get('/board', (req, res) => {
    handleBoard(req, res);
})

app.get('/submit', (req, res) => {
    submit.handleSubmit(req, res);
})

app.listen(4000 , ()=>{
    console.log("Wordplay Server v1.0.0 started running on port 4000");
});

setInterval(() => {
    for (let i in GameManager.games) {
        let game = GameManager.games[i];
        if (game.players.length == 1) {
            if (Date.now() - game.players[0].lastPing > 85000) {
                GameManager.remove(game.id);
                console.log(`Game with id : ${game.id} has been pruned due to inactivity`);
            }
        } else {
            if (Date.now() - game.players[0].lastPing > 85000 && Date.now() - game.players[1].lastPing > 85000) {
                GameManager.remove(game.id);
                console.log(`Game with id : ${game.id} has been pruned due to inactivity`);
            }
        }
    }
}, 2000);