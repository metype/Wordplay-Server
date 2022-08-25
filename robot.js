import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
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
        this.id = randomBytes(12).toString("hex");
        this.lastSeen = Infinity;
        this.lastPing = Infinity;
        console.log(`A robotic player was made for game ${this.gameid}`)
    }

    makeSubmition() {
        let leadingWord = "";
        let leadingScore = -Infinity;
        let wordsArray = Array.from(words)
        for(let i=0; i<10; i++){
            let word = "";
            while(true) {
                word = wordsArray[Math.floor(Math.random()*wordsArray.length)];
                if(word.length <= 7) break;
            }
            let game = JSON.parse(JSON.stringify(GameManager.get(this.gameid)));
            let score = BoardHandler.calculateBoardScore(this.id, SubmitHandler.newBoardState(word, game, this));
            if(score > leadingScore && Math.random() > 0.5) leadingWord = word;
        }
        SubmitHandler.submitWord(leadingWord, GameManager.get(this.gameid), this);
    }
}