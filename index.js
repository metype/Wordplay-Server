import { readFileSync } from 'node:fs';
import express from 'express';
import { randomBytes } from 'node:crypto';
import cors from 'cors';
const { Express, Request, Response } = express;

const app = express();

app.use(cors());

let words = new Set(readFileSync('words-alpha.txt').toString().split('\n'));

let games = [];

app.get('/join', (req, res) => {
    handleJoin(req, res);
})

app.get('/board', (req, res) => {
    handleBoard(req, res);
})

app.get('/submit', (req, res) => {
    handleSubmit(req, res);
})

app.listen(4000 , ()=>{
    console.log("Wordplay Server v1.0.0 started running on port 4000");
});

setInterval(() => {
    for (let game of games) {
        if (game.players.length == 1) {
            if (Date.now() - game.players[0].lastPing > 85000) {
                games.splice(games.indexOf(game), 1);
                console.log(`Game with id : ${game.id} has been pruned due to inactivity`);
            }
        } else {
            if (Date.now() - game.players[0].lastPing > 85000 && Date.now() - game.players[1].lastPing > 85000) {
                games.splice(games.indexOf(game), 1);
                console.log(`Game with id : ${game.id} has been pruned due to inactivity`);
            }
        }
    }
}, 2000);

function newBoardState(word, game, player) {
    let gameCopy = game;
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    for (let i = 0; i < word.length; i++){
        const currentLetter = gameCopy.boardState[0].boardState[alphabet.indexOf(word.slice(i, i + 1).toUpperCase())];
        if (currentLetter != ((gameCopy.players[0].id==player.id)?1:2)) {
            gameCopy.boardState[0].boardState[alphabet.indexOf(word.slice(i, i + 1).toUpperCase())] = (gameCopy.players[0].id==player.id)?1:2;
        }
        else {
            gameCopy.boardState[0].boardState[alphabet.indexOf(word.slice(i, i + 1).toUpperCase())] = 0;
        }
        for (let i in gameCopy.boardState[0].boardState) {
            if (gameCopy.boardState[0].boardState[i] == 0)
                gameCopy.boardState[1].boardState[i] = 0
            if (gameCopy.boardState[0].boardState[i] == 1)
                gameCopy.boardState[1].boardState[i] = 2;
            if (gameCopy.boardState[0].boardState[i] == 2)
                gameCopy.boardState[1].boardState[i] = 1;
        }
    }
    return gameCopy;
}

function submitWord(word, game, player) {
    game.usedWords.push(word.toLowerCase());
    let ret = "Other Player's Turn!"
    game = newBoardState(word, game, player);
    game.turn++;
    game.turn %= 2;
    let num1 = 0;
    let num2 = 0;
    for (let i in game.boardState[0].boardState) {
        if (game.boardState[0].boardState[i] == 1) num1++;
        if (game.boardState[0].boardState[i] == 2) num2++;
    }
    if (num1 / 26.0 > .4) game.winner = game.players[0].id;
    if (num2 / 26.0 > .4) game.winner = game.players[1].id;

    return ret;
}

function handleJoin(req, res){
    if (req.query.id == undefined) {
        return;
    }
    let player = {
        id: req.query.id,
        lastPing: Date.now(),
        lastSeen: Date.now(),
    };
    for (let i in games) {
        if (games[i].players.length < 2) {
            games[i].players.push(player);
            games[i].boardState.push({
                id: player.id,
                boardState: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            })
            let ret = {
                id: games[i].id,
            };
            res.json(ret);
            return;
        }
    }
    let game = {
        id: randomBytes(24).toString("hex"),
        players: [player],
        boardState: [
            {
                id: player.id,
                boardState: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            }
        ],
        turn: 0,
        usedWords: [],
    };
    games.push(game);
    let ret = {
        id: game.id,
    };
    res.json(ret);
}

function handleBoard(req, res) {
    if (req.query.id == undefined || req.query.game_id == undefined) {
        return;
    }
    let player = {
        id: req.query.id,
    };
    let game;
    for (let i in games) {
        if (games[i].id == req.query.game_id) {
            game = games[i];
            break;
        }
    }
    if (game == undefined) {
        res.status(404);
        res.json({
            game_status: "This Game Does Not Exist!",
        });
        return;
    }
    if (game.players[0].id == player.id) {
        game.players[0].lastPing = Date.now();
    }
    if (game.players[1]?.id == player.id) {
        game.players[1].lastPing = Date.now();
    }
    let ret;
    if (game.boardState[0].id === player.id) {
        ret = {
            board_state: game.boardState[0].boardState,
            turn: Math.abs(game.turn - 1),
            words: game.usedWords,
        }
    } else if (game.boardState[1].id === player.id) {
        ret = {
            board_state: game.boardState[1].boardState,
            turn: game.turn,
            words: game.usedWords,
        }
    } else {
        return;
    }
    if (((Date.now() - game.players[0].lastSeen > 75000 && game.turn == 0) || Date.now() - game.players[0].lastPing > 15000)) {
        if (game.players[0].id == player.id) {
            res.status(201);
            ret.gameStatus = "AFK Forefit!";
        }   
        if (game.players[1]?.id == player.id) {
            res.status(201);
            ret.gameStatus = "Competition Forefit!";
        }   
    }
    if (((Date.now() - game.players[1]?.lastSeen > 75000 && game.turn == 1) || Date.now() - game.players[1]?.lastPing > 15000)) {
        if (game.players[1]?.id == player.id) {
            res.status(201);
            ret.gameStatus = "AFK Forefit!";
        }   
        if (game.players[0].id == player.id) {
            res.status(201);
            ret.gameStatus = "Competition Forefit!";
        }   
    }
    if (game.winner == player.id) {
        res.status(201);
        ret.game_status = "You Win!";
    } else if (game.winner != undefined) {
        res.status(201);
        ret.game_status = "You Lose!";
    }
    res.json(ret);
}

function handleSubmit(req, res) {
    if (req.query.word == undefined || req.query.id == undefined || req.query.game_id == undefined) {
        return;
    }
    let player = {
        id: req.query.id,
    };
    let word = req.query.word;
    let ret;
    let game;
    for (let i in games) {
        if (games[i].id == req.query.game_id) {
            game = games[i];
            break;
        }
    }
    if (game == undefined) {
        res.status(404);
        res.json({
            game_status: "This Game Does Not Exist!",
        });
        return;
    }
    if (game.players[0].id == player.id) {
        game.players[0].lastSeen = Date.now();
    }
    if (game.players[1]?.id == player.id) {
        game.players[1].lastSeen = Date.now();
    }
    if (game.players.length < 2) {
        res.status(201);
        res.json({
            game_status: "This Game Has Not Yet Started!",
        });
        return;
    }
    if ((game.turn==0 && game.players[1].id == player.id) ||(game.turn==1 && game.players[0].id == player.id)) {
        res.status(201);
        res.json({
            game_status: "It Is Not Your Turn!",
        });
        return;
    }
    if (words.has(word.toLowerCase()) && !game.usedWords.includes(word.toLowerCase())) {
        ret = submitWord(word, game, player);
        res.status(200);
    } else {
        ret = {
            game_status: `'${word.toUpperCase()}' Is Not A Valid Word!`,
        };
        res.status(201);
    }
    res.json(ret);
}