var GameManager = {
    games: [],
    add: function(game) {
        this.games.push(game);
    },
    remove: function (id) {
        for (let i in this.games) {
            if (this.games[i].id == id)
                this.games.splice(i, i+1);
        }
    },
    set: function (id, game) {
        for (let i in this.games) {
            if (this.games[i].id == id)
                this.games[i] = game;
        }
    },
    get: function (id) {
        for (let game of this.games) {
            if (game.id == id) return game;
        }
        return undefined;
    }
}

export default GameManager;