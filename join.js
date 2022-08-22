import { randomBytes } from 'node:crypto';
import GameManager from './games.js';

export default function handleJoin(req, res) {
    if (req.query.id == undefined) {
        return;
    }
    let player = {
        id: req.query.id,
        lastPing: Date.now(),
        lastSeen: Date.now(),
    };
    for (let i in GameManager.games) {
        let game = GameManager.games[i];
        if (game.players.length < 2) {
            game.players.push(player);
            game.boardState.push({
                id: player.id,
                boardState: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            })
            let ret = {
                id: game.id,
            };
            GameManager.set(game.id, game);
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
    GameManager.add(game);
    let ret = {
        id: game.id,
    };
    res.json(ret);
}