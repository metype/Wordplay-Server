import { readFileSync } from 'node:fs';

import GameManager from './games.js';

let words = new Set(readFileSync('words-alpha.txt').toString().split('\n'));

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

function handleSubmit(req, res) {
    if (req.query.word == undefined || req.query.id == undefined || req.query.game_id == undefined) {
        return;
    }
    let player = {
        id: req.query.id,
    };
    let word = req.query.word;
    let ret;
    let game = GameManager.get(req.query.game_id);
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
    if (words.has(word.toLowerCase()+"\r") && !game.usedWords.includes(word.toLowerCase())) {
        ret = submitWord(word, game, player);
        res.status(200);
    } else {
        ret = {
            game_status: `'${word.toUpperCase()}' Is Not A Valid Word!`,
        };
        res.status(201);
    }
    GameManager.set(game.id, game);
    res.json(ret);
}

export default {
    newBoardState,
    submitWord,
    handleSubmit
}