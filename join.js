import { randomBytes } from 'node:crypto';
import GameManager from './games.js';

function handleJoin(req, res) {
    if (req.query.id == undefined) {
        res.status(400);
        res.json({
            game_status: "Malformed Request",
        });
        return;
    }
    ret = joinGame(req.query.id, null);
    res.status(ret.statusCode)
    res.json(ret.responseData);
}

function joinGame(id, requestedGameID = null, forcedPlayerStructure = null) {
    let returnedStructure = {
        statusCode: 200,
        responseData: {}
    }
    let player = {};
    if(forcedPlayerStructure = null)
        player = {
            id: id,
            lastPing: Date.now(),
            lastSeen: Date.now(),
        };
    else
        player = forcedPlayerStructure;
    for (let i in GameManager.games) {
        let game = GameManager.games[i];
        if (game.players.length < 2 || (requestedGameID == game.id)) {
            game.players.push(player);
            game.boardState.push({
                id: player.id,
                boardState: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            })
            returnedStructure.responseData = {
                id: game.id,
            };
            GameManager.set(game.id, game);
            return returnedStructure;
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
    GameManager.add(game);
    returnedStructure.responseData = {
        id: game.id,
    };
}

export default {
    handleJoin,
    joinGame
}