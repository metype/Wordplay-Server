import { randomBytes } from 'node:crypto';
import GameManager from './games.js';
import BoardHandler from './board.js';
import SubmitHandler from './submit.js';

let words = new Set(readFileSync('words-alpha.txt').toString().split('\n'));

export default class RoboticPlayer {
    constructor(game) {
        if(typeof game === 'string')
            this.gameid = game;
        else
            this.gameid = game.id;

        this.bot = true;
        this.id = randomBytes(24).toString("hex");
        this.lastSeen = Infinity;
        this.lastPing = Infinity;
    }

    makeSubmition() {
        let leadingWord = "";
        let leadingScore = -Infinity;
        for(let i=0; i<10; i++){
            let word = words[Math.floor(Math.random()*words.size())];
            let game = GameManager.get(this.gameId);
            let score = BoardHandler.calculateBoardScore(this.id, SubmitHandler.newBoardState(word, game, this));
            if(score > leadingScore) leadingWord = word;
        }
        GameManager.set(this.gameid, SubmitHandler.submitWord(leadingWord, GameManager.get(this.gameId), this));
    }
}