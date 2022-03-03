/**
 * Created by Ruben on 30-5-2015.
 */
function random(max, factor) {
    return (Math.random() * max / factor).toFixed(0) * factor;
}

function Vierkant(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
}

function Snake() {
    this.vierkanten = [];
    this.directionX =  spelView.size;
    this.directionY = 0;
}

Snake.prototype.addSquare = function(square) {
    this.vierkanten.push(square);
}

Snake.prototype.move= function() {
    this.headOnTarget();

    // Move body
    for(var i = this.vierkanten.length - 1; i > 0; i--) {
        this.vierkanten[i].x = this.vierkanten[i - 1].x;
        this.vierkanten[i].y = this.vierkanten[i - 1].y;
    }

    // Move head
    if(spelView.gamemode.wall) {
        this.vierkanten[0].x += this.directionX;
        this.vierkanten[0].y += this.directionY;

        this.headAgainstWall();
    }
    else {
        this.vierkanten[0].x = (this.vierkanten[0].x + this.directionX + spelView.cv.width) % spelView.cv.width;
        this.vierkanten[0].y = (this.vierkanten[0].y + this.directionY + spelView.cv.height) % spelView.cv.height;
    }

    this.headAgainstBody();
    this.headAgainstObstacle();
}

Snake.prototype.headOnTarget = function() {
    var headX = this.vierkanten[0].x;
    var headY = this.vierkanten[0].y;

    // Head on target
    if(headX === spelView.spel.doel.x && headY === spelView.spel.doel.y) {
        this.addSquare(new Vierkant(0, 0, "black"));

        // Genereer nieuw doel
        spelView.spel.createTarget();

        // Update score
        spelView.score += 10;

        // Set score and highscore
        // Reload html so score and highscore will update
        if(spelView.score > spelView.highscore[spelView.gamemode.name]) {
            spelView.highscore[spelView.gamemode.name] = spelView.score;
        }

        spelView.scoreToHtml();
        spelView.highscoreToHtml();
    }
};

Snake.prototype.headAgainstWall = function() {
    var headX = this.vierkanten[0].x;
    var headY = this.vierkanten[0].y;

    if(headX >= spelView.cv.width || headX < 0 || headY >= spelView.cv.height || headY < 0) {
        spelView.gameOver();
    }
};

Snake.prototype.headAgainstBody = function() {
    var headX = this.vierkanten[0].x;
    var headY = this.vierkanten[0].y;

    for(var i = 1; i <= this.vierkanten.length - 1; i++) {
        if(this.vierkanten[i].x === headX && this.vierkanten[i].y === headY) {
            spelView.gameOver();
        }
    }
};

Snake.prototype.headAgainstObstacle = function() {
    var headX = this.vierkanten[0].x;
    var headY = this.vierkanten[0].y;
    var obstacles = spelView.spel.obstacles;

    for(var i = 0; i <= obstacles.length - 1; i++) {
        if(obstacles[i].x === headX && obstacles[i].y === headY) {
            spelView.gameOver();
        }
    }
}

function Spel() {
    this.snake = new Snake();
    this.doel;
    this.obstacles;

    this.createObstacles();
    this.createTarget();
    this.createSnake();
}

Spel.prototype.createSnake = function() {
    // Generate target
    // Make sure the target is not on any obstacle
    //var coordinates = function(x, y) {
    var x = random(spelView.cv.width - spelView.size, spelView.size);
    var y = random(spelView.cv.width - spelView.size, spelView.size);

    for(var i = 0; i < this.obstacles.length; i++) {
        if(this.obstacles[i].x === x && this.obstacles[i].y === y) {
            x = random(spelView.cv.width - spelView.size, spelView.size);
            y = random(spelView.cv.width - spelView.size, spelView.size);

            i = 0;
        }
    }

    this.snake.addSquare(new Vierkant(x, y, "blue"));
};

Spel.prototype.createTarget = function() {
    // Generate target
    // Make sure the target is not on any obstacle
    //var coordinates = function(x, y) {
    var x = random(spelView.cv.width - spelView.size, spelView.size);
    var y = random(spelView.cv.width - spelView.size, spelView.size);

    for(var i = 0; i < this.obstacles.length; i++) {
        if(this.obstacles[i].x === x && this.obstacles[i].y === y) {
            x = random(spelView.cv.width - spelView.size, spelView.size);
            y = random(spelView.cv.width - spelView.size, spelView.size);

            i = 0;
        }
    }

    this.doel = new Vierkant(x, y, "red");
};

var gamemodes = {
    slow: {name: "slow", speed: 175, wall: true},
    normal: {name: "normal", speed: 100, wall: true},
    fast: {name: "fast", speed: 50, wall: true},
    veryFast: {name: "veryFast", speed: 25, wall: true}
};

Spel.prototype.createObstacles = function() {
    // Generate obstacles
    // Amount is defined in spelView
    var obstacles = [];

    for(var i = 0; i < spelView.obstacles; i++) {
        var randomX = random(spelView.cv.width - spelView.size, spelView.size);
        var randomY = random(spelView.cv.width - spelView.size, spelView.size);

        obstacles.push(new Vierkant(
                randomX,
                randomY,
                "#457d3e"
            )
        );
    }

    this.obstacles = obstacles;
}

var spelView = {
    cv: null,
    ctx: null,
    spel: null,
    obstacles: 20,
    intervalId: null,
    score: 0,
    highscore: {slow: 0, normal: 0, fast: 0, veryFast: 0},
    globalHighscores: null,
    keyCodeCache: [],
    size: 10,
    inGame: false,
    gamemode: gamemodes.normal,
    init: function() {
        this.cv = document.getElementById("myCanvas");
        this.ctx = this.cv.getContext("2d");

        this.getHighScore();
        this.scoreToHtml();
        this.highscoreToHtml();

        $("#play").click(function() {
            spelView.inGame = true;

            // Set gamemode and additions
            spelView.gamemode = gamemodes[$("#gamemode").val()];
            console.log($("input[type='radio']:checked").val() === "on" ? true : false);
            spelView.gamemode.wall = ($("input[type='radio']:checked").val() === "on" ? true : false);

            $("#panel").slideUp(400);

            // Set score to 0
            // Be sure that the keyCodeCache is empty
            // Create new Game object
            spelView.score = 0;
            spelView.keyCodeCache = [];
            spelView.spel = new Spel();

            spelView.scoreToHtml();
            spelView.highscoreToHtml();
            spelView.countDown();
        });

        $("html").keyup(function(e) {
            if(e.keyCode === 13 && !spelView.inGame) {
                spelView.inGame = true;

                // Set gamemode and additions
                spelView.gamemode = gamemodes[$("#gamemode").val()];
                spelView.gamemode.wall = ($("input[type='radio']:checked").val() === "on" ? true : false);

                $("#panel").slideUp(400);

                // Set score to 0
                // Be sure that the keyCodeCache is empty
                // Create new Game object
                spelView.score = 0;
                spelView.keyCodeCache = [];
                spelView.spel = new Spel();

                spelView.scoreToHtml();
                spelView.highscoreToHtml();
                spelView.countDown();
            }
        });
    },
    tekenSpel: function() {
        this.clearCanvas();

        var snake = this.spel.snake;
        var doel = this.spel.doel;
        var obstacles = this.spel.obstacles;

        // Teken doel
        this.ctx.beginPath();
        this.ctx.fillStyle = doel.color;
        this.ctx.fillRect(doel.x, doel.y, this.size, this.size);
        this.ctx.closePath();

        // Draw snake
        for(var key in snake.vierkanten) {
            var square = snake.vierkanten[key];

            this.ctx.beginPath();
            this.ctx.fillStyle = square.color;
            this.ctx.fillRect(square.x, square.y, this.size, this.size);
            this.ctx.fill();
            this.ctx.closePath();
        }

        // Draw obstacles
        for(var key in obstacles) {
            var square = obstacles[key];

            this.ctx.beginPath();
            this.ctx.fillStyle = square.color;
            this.ctx.fillRect(square.x, square.y, this.size, this.size);
            this.ctx.closePath();
        }
    },
    clearCanvas: function() {
        this.cv.width = this.cv.width;
    },
    startInterval: function() {
        var intervalId = setInterval(function() {
            spelView.executeControls();
            spelView.play();
        }, this.gamemode.speed);

        return intervalId;
    },
    stopInterval: function(id) {
        clearInterval(id);
    },
    scoreToHtml: function() {
        $("#score").text(this.score);
    },
    highscoreToHtml: function() {
        $("#highscoreSlow").text(this.highscore.slow);
        $("#highscoreNormal").text(this.highscore.normal);
        $("#highscoreFast").text(this.highscore.fast);
        $("#highscoreVeryFast").text(this.highscore.veryFast);
    },
    play: function() {
            spelView.spel.snake.move();
            spelView.tekenSpel();
    },
    controls: function() {
        var keys = {
            38: {isDown: false},
            40: {isDown: false},
            37: {isDown: false},
            39:{isDown: false}
        };

        // Disable second keypress until it traveled back up
        $("html").keydown(function(e) {
            if (keys[e.keyCode] && !keys[e.keyCode].isDown) {
                keys[e.keyCode].isDown = true;
                spelView.keyCodeCache.push(e.keyCode);
            }
        });
        $('html').keyup(function(e){
            if (keys[e.keyCode]){
                keys[e.keyCode].isDown = false;
            }
        })
    },
    executeControls: function() {
        var notSuccessful = true;
        var direction = {
            38: {x: 0, y: -this.size},
            40: {x: 0, y: this.size},
            37: {x: -this.size, y: 0},
            39: {x: this.size, y: 0}
        }

        // If keyCode fails, immediately the next keyCode will be tested,
        // this way it does not have to wait for the interval
        while(notSuccessful && this.keyCodeCache.length != 0) {
            var keyCode = this.keyCodeCache.shift();

            // Test if snake will reverse it's course
            // If so get the next keyCode, else stop while loop and change course
            if(spelView.spel.snake.directionX !== -direction[keyCode].x && spelView.spel.snake.directionY !== -direction[keyCode].y) {
                spelView.spel.snake.directionX = direction[keyCode].x;
                spelView.spel.snake.directionY = direction[keyCode].y;

                notSuccessful = false;
            }
        }
    },
    countDown: function() {
        var myFunction = function(seconds) {
            if(seconds === 0) {
                spelView.controls();
                spelView.intervalId = spelView.startInterval();
            }
            else{
                //spelView.clearCanvas();
                spelView.tekenSpel();
                spelView.ctx.beginPath();
                spelView.ctx.font = "48px sans-serif";
                spelView.ctx.textAlign = "center";
                spelView.ctx.fillStyle = "black";
                spelView.ctx.fillText(seconds, spelView.cv.width / 2, spelView.cv.height / 2);
                spelView.ctx.closePath();

                setTimeout(function() {
                    myFunction(--seconds)
                }, 1000);
            }
        }

        myFunction(3);
    },
    gameOver: function() {
        this.stopInterval(this.intervalId);
        this.storeHighScore();
        this.inGame = false;

        $("#message").text("Game over! Your score was " + this.score + "!");
        $("#play").text("Play again!");
        $("#panel").slideDown(400);
    },
    storeHighScore: function() {
        window.localStorage.highscoreSnake = JSON.stringify(this.highscore);
    },
    getHighScore: function() {
        if(window.localStorage.highscoreSnake) {
            this.highscore = JSON.parse(window.localStorage.highscoreSnake);
        }
    }
};

$(document).ready(function() {
    spelView.init();
});