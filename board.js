import GameManager from './games.js';

export default function handleBoard(req, res) {
    if (req.query.id == undefined || req.query.game_id == undefined) {
        return;
    }
    let player = {
        id: req.query.id,
    };
    let game = GameManager.get(req.query.game_id);
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
    GameManager.set(game.id, game);
    res.json(ret);
}