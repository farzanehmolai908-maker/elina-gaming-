/* =========================================
   🍄 قارچ‌خور
   game.js
   نسخه کامل پایه
========================================= */

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


// =========================================
// Canvas
// =========================================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

resizeCanvas();

window.addEventListener(
    "resize",
    resizeCanvas
);


// =========================================
// وضعیت بازی
// =========================================

let currentWorld = 1;
let currentLevel = 1;

let lives = 3;
let coins = 0;
let score = 0;

let gameRunning = false;
let paused = false;

let animationId;


// =========================================
// بازیکن
// =========================================

const player = {

    x: 120,
    y: 300,

    width: 44,
    height: 62,

    vx: 0,
    vy: 0,

    speed: 5,

    jumpPower: 14,

    grounded: false,

    direction: 1,

    invincible: 0

};


// =========================================
// جهان
// =========================================

const world = {

    width: 5000,

    gravity: 0.65,

    groundY: 0

};


// =========================================
// دوربین
// =========================================

let cameraX = 0;


// =========================================
// اشیا
// =========================================

let platforms = [];
let coinItems = [];
let enemies = [];
let bullets = [];


// =========================================
// پرچم
// =========================================

const flag = {

    x: 4700,

    y: 0,

    width: 45,

    height: 90

};


// =========================================
// کنترل
// =========================================

const keys = {

    left: false,
    right: false

};


// =========================================
// تغییر صفحه
// =========================================

function showScreen(id) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove("active");

        });

    const screen =
        document.getElementById(id);

    if (screen) {

        screen.classList.add("active");

    }

}


// =========================================
// بازگشت
// =========================================

document
    .querySelectorAll("[data-back]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                gameRunning = false;

                showScreen(
                    button.dataset.back
                );

            }
        );

    });


// =========================================
// منوی اصلی
// =========================================

document
    .getElementById("worldBtn")
    .addEventListener(
        "click",
        () => {

            showScreen("worldMenu");

        }
    );


document
    .getElementById("guideBtn")
    .addEventListener(
        "click",
        () => {

            showScreen("guideMenu");

        }
    );


// =========================================
// انتخاب جهان
// =========================================

document
    .querySelectorAll(".worldCard")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const worldNumber =
                    Number(card.dataset.world);

                if (worldNumber !== 1) {

                    alert(
                        "🔒 این جهان هنوز قفل است!"
                    );

                    return;
                }

                currentWorld =
                    worldNumber;

                createLevelButtons();

                showScreen("levelMenu");

            }
        );

    });


// =========================================
// ساخت مراحل
// =========================================

function createLevelButtons() {

    const grid =
        document.getElementById(
            "levelGrid"
        );

    grid.innerHTML = "";

    for (
        let level = 1;
        level <= 10;
        level++
    ) {

        const button =
            document.createElement("button");

        button.className =
            "levelButton";

        button.textContent =
            level;

        if (level !== 1) {

            button.classList.add(
                "locked"
            );

        }

        button.addEventListener(
            "click",
            () => {

                if (level !== 1) {

                    alert(
                        "🔒 ابتدا مرحله قبلی را کامل کن!"
                    );

                    return;
                }

                currentLevel =
                    level;

                startGame();

            }
        );

        grid.appendChild(button);

    }

}


// =========================================
// شروع بازی
// =========================================

document
    .getElementById("startBtn")
    .addEventListener(
        "click",
        () => {

            currentWorld = 1;
            currentLevel = 1;

            startGame();

        }
    );


function startGame() {

    lives = 3;
    coins = 0;
    score = 0;

    paused = false;
    gameRunning = true;

    updateHUD();

    showScreen("gameScreen");

    createLevel();

    cancelAnimationFrame(
        animationId
    );

    gameLoop();

}


// =========================================
// ساخت مرحله
// =========================================

function createLevel() {

    platforms = [];
    coinItems = [];
    enemies = [];
    bullets = [];

    player.x = 120;
    player.y = 300;

    player.vx = 0;
    player.vy = 0;

    player.invincible = 0;

    cameraX = 0;


    // زمین

    platforms.push({

        x: 0,

        y: 0,

        width: world.width,

        height: 120

    });


    // سکوها

    const platformData = [

        [450, 430, 220],
        [850, 350, 220],
        [1250, 430, 260],
        [1700, 350, 220],
        [2150, 420, 250],
        [2650, 330, 220],
        [3100, 420, 280],
        [3600, 350, 250],
        [4050, 420, 250]

    ];


    platformData.forEach(data => {

        platforms.push({

            x: data[0],

            y: data[1],

            width: data[2],

            height: 30

        });

    });


    // سکه‌ها

    for (
        let i = 0;
        i < 25;
        i++
    ) {

        coinItems.push({

            x: 280 + i * 175,

            y:
                350 -
                (i % 3) * 45,

            radius: 12,

            collected: false

        });

    }


    // دشمن‌ها

    const enemyPositions = [

        650,
        1100,
        1550,
        2050,
        2500,
        3000,
        3500,
        4200

    ];


    enemyPositions.forEach(
        (x, index) => {

            enemies.push({

                x: x,

                y: 0,

                width: 45,

                height: 45,

                vx:
                    index % 2 === 0
                        ? 1.5
                        : -1.5,

                alive: true

            });

        }
    );


    flag.y = 410;

}


// =========================================
// کیبورد
// =========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "ArrowLeft"
        ) {

            keys.left = true;

        }

        if (
            event.key === "ArrowRight"
        ) {

            keys.right = true;

        }

        if (
            event.key === "ArrowUp" ||
            event.key === " "
        ) {

            jump();

        }

        if (
            event.key === "z" ||
            event.key === "Z"
        ) {

            shoot();

        }

    }
);


document.addEventListener(
    "keyup",
    event => {

        if (
            event.key === "ArrowLeft"
        ) {

            keys.left = false;

        }

        if (
            event.key === "ArrowRight"
        ) {

            keys.right = false;

        }

    }
);


// =========================================
// دکمه لمسی
// =========================================

function setupHoldButton(
    element,
    start,
    end
) {

    element.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            start();

        }
    );


    element.addEventListener(
        "pointerup",
        event => {

            event.preventDefault();

            end();

        }
    );


    element.addEventListener(
        "pointercancel",
        end
    );


    element.addEventListener(
        "pointerleave",
        end
    );

}


setupHoldButton(

    document.getElementById(
        "leftBtn"
    ),

    () => {
        keys.left = true;
    },

    () => {
        keys.left = false;
    }

);


setupHoldButton(

    document.getElementById(
        "rightBtn"
    ),

    () => {
        keys.right = true;
    },

    () => {
        keys.right = false;
    }

);


// پرش

document
    .getElementById("jumpBtn")
    .addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            jump();

        }
    );


// شلیک

document
    .getElementById("shootBtn")
    .addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            shoot();

        }
    );


// =========================================
// پرش
// =========================================

function jump() {

    if (
        !gameRunning ||
        paused
    ) {

        return;

    }

    if (player.grounded) {

        player.vy =
            -player.jumpPower;

        player.grounded =
            false;

    }

}


// =========================================
// شلیک
// =========================================

function shoot() {

    if (
        !gameRunning ||
        paused
    ) {

        return;

    }

    bullets.push({

        x:
            player.direction === 1
                ? player.x + player.width
                : player.x,

        y:
            player.y + 25,

        width: 18,

        height: 10,

        vx:
            player.direction * 10

    });

}


// =========================================
// آپدیت بازیکن
// =========================================

function updatePlayer() {

    player.vx = 0;


    if (keys.left) {

        player.vx =
            -player.speed;

        player.direction = -1;

    }


    if (keys.right) {

        player.vx =
            player.speed;

        player.direction = 1;

    }


    player.x += player.vx;


    player.vy +=
        world.gravity;

    player.y +=
        player.vy;


    player.grounded =
        false;


    // برخورد با زمین و سکوها

    platforms.forEach(
        platform => {

            if (

                player.x <
                    platform.x +
                    platform.width &&

                player.x +
                    player.width >
                    platform.x &&

                player.y +
                    player.height >=
                    platform.y &&

                player.y +
                    player.height <=
                    platform.y +
                    35 &&

                player.vy >= 0

            ) {

                player.y =
                    platform.y -
                    player.height;

                player.vy = 0;

                player.grounded =
                    true;

            }

        }
    );


    if (player.x < 0) {

        player.x = 0;

    }


    if (
        player.y >
        canvas.height + 300
    ) {

        loseLife();

    }


    if (
        player.invincible > 0
    ) {

        player.invincible--;

    }

}


// =========================================
// دشمن‌ها
// =========================================

function updateEnemies() {

    enemies.forEach(
        enemy => {

            if (!enemy.alive) {

                return;

            }

            enemy.x +=
                enemy.vx;


            if (
                enemy.x < 300 ||
                enemy.x > 4500
            ) {

                enemy.vx *= -1;

            }

        }
    );

}


// =========================================
// گلوله‌ها
// =========================================

function updateBullets() {

    bullets.forEach(
        bullet => {

            bullet.x +=
                bullet.vx;

        }
    );


    bullets =
        bullets.filter(
            bullet =>
                bullet.x >
                    cameraX - 200 &&
                bullet.x <
                    cameraX +
                    canvas.width +
                    200
        );


    bullets.forEach(
        bullet => {

            enemies.forEach(
                enemy => {

                    if (
                        enemy.alive &&
                        collision(
                            bullet,
                            enemy
                        )
                    ) {

                        enemy.alive =
                            false;

                        score += 100;

                        updateHUD();

                    }

                }
            );

        }
    );

}


// =========================================
// سکه
// =========================================

function updateCoins() {

    coinItems.forEach(
        coin => {

            if (coin.collected) {

                return;

            }


            const dx =
                player.x +
                player.width / 2 -
                coin.x;


            const dy =
                player.y +
                player.height / 2 -
                coin.y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance < 38
            ) {

                coin.collected =
                    true;

                coins++;

                score += 10;

                updateHUD();

            }

        }
    );

}


// =========================================
// برخورد دشمن
// =========================================

function checkEnemyCollision() {

    if (
        player.invincible > 0
    ) {

        return;

    }


    enemies.forEach(
        enemy => {

            if (
                !enemy.alive
            ) {

                return;

            }


            if (
                collision(
                    player,
                    enemy
                )
            ) {

                // پریدن روی دشمن

                if (
                    player.vy > 0 &&
                    player.y +
                    player.height -
                    10 <
                    enemy.y + 20
                ) {

                    enemy.alive =
                        false;

                    player.vy = -9;

                    score += 100;

                    updateHUD();

                } else {

                    loseLife();

                }

            }

        }
    );

}


// =========================================
// برخورد
// =========================================

function collision(a, b) {

    return (

        a.x <
            b.x + b.width &&

        a.x + a.width >
            b.x &&

        a.y <
            b.y + b.height &&

        a.y + a.height >
            b.y

    );

}


// =========================================
// کم شدن جان
// =========================================

function loseLife() {

    if (
        player.invincible > 0
    ) {

        return;

    }


    lives--;

    updateHUD();


    if (lives <= 0) {

        gameOver();

        return;

    }


    player.x = 120;
    player.y = 300;

    player.vx = 0;
    player.vy = 0;

    cameraX = 0;

    player.invincible =
        100;

}


// =========================================
// پرچم
// =========================================

function checkFlag() {

    const flagBox = {

        x: flag.x,

        y: flag.y,

        width: flag.width,

        height: flag.height

    };


    if (
        collision(
            player,
            flagBox
        )
    ) {

        completeLevel();

    }

}


// =========================================
// پایان مرحله
// =========================================

function completeLevel() {

    gameRunning = false;

    document
        .getElementById(
            "completeScore"
        )
        .textContent = score;


    document
        .getElementById(
            "completeCoins"
        )
        .textContent = coins;


    showScreen(
        "levelCompleteMenu"
    );

}


// =========================================
// Game Over
// =========================================

function gameOver() {

    gameRunning = false;

    document
        .getElementById(
            "finalScore"
        )
        .textContent = score;


    showScreen(
        "gameOverMenu"
    );

}


// =========================================
// HUD
// =========================================

function updateHUD() {

    document
        .getElementById("lives")
        .textContent = lives;

    document
        .getElementById("coins")
        .textContent = coins;

    document
        .getElementById("score")
        .textContent = score;

    document
        .getElementById("hudWorld")
        .textContent = currentWorld;

    document
        .getElementById("hudLevel")
        .textContent = currentLevel;

}


// =========================================
// دوربین
// =========================================

function updateCamera() {

    cameraX =
        player.x -
        canvas.width * 0.35;


    if (cameraX < 0) {

        cameraX = 0;

    }


    const maxCamera =
        Math.max(
            0,
            world.width -
            canvas.width
        );


    if (
        cameraX >
        maxCamera
    ) {

        cameraX =
            maxCamera;

    }

}


// =========================================
// پس‌زمینه
// =========================================

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );


    gradient.addColorStop(
        0,
        "#55c9f5"
    );

    gradient.addColorStop(
        1,
        "#b7ed91"
    );


    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // خورشید

    ctx.font =
        "85px Arial";

    ctx.fillText(
        "☀️",
        30 -
            cameraX * .08,
        130
    );


    // ابرها

    ctx.font =
        "65px Arial";

    ctx.fillText(
        "☁️",
        380 -
            cameraX * .12,
        170
    );

    ctx.fillText(
        "☁️",
        950 -
            cameraX * .10,
        130
    );

    ctx.fillText(
        "☁️",
        1550 -
            cameraX * .08,
        190
    );


    // کوه‌های دور

    ctx.fillStyle =
        "#6bb46b";


    ctx.beginPath();

    ctx.moveTo(
        0,
        500
    );

    for (
        let x = -500;
        x < canvas.width + 1000;
        x += 300
    ) {

        const worldX =
            x +
            cameraX * .18;

        ctx.lineTo(
            x,
            350 -
                Math.sin(
                    worldX * .004
                ) * 90
        );

    }

    ctx.lineTo(
        canvas.width,
        canvas.height
    );

    ctx.lineTo(
        0,
        canvas.height
    );

    ctx.closePath();

    ctx.fill();

}


// =========================================
// زمین و سکوها
// =========================================

function drawPlatforms() {

    platforms.forEach(
        platform => {

            const x =
                platform.x -
                cameraX;


            // خاک

            ctx.fillStyle =
                "#89592e";

            ctx.fillRect(
                x,
                platform.y,
                platform.width,
                platform.height
            );


            // چمن

            ctx.fillStyle =
                "#54ae45";

            ctx.fillRect(
                x,
                platform.y,
                platform.width,
                10
            );


            // بافت خاک

            ctx.fillStyle =
                "rgba(70,40,20,.18)";

            for (
                let px = x;
                px < x + platform.width;
                px += 45
            ) {

                ctx.fillRect(
                    px + 8,
                    platform.y + 20,
                    5,
                    5
                );

            }

        }
    );

}


// =========================================
// سکه‌ها
// =========================================

function drawCoins() {

    coinItems.forEach(
        coin => {

            if (
                coin.collected
            ) {

                return;

            }


            const x =
                coin.x -
                cameraX;


            ctx.beginPath();

            ctx.arc(
                x,
                coin.y,
                coin.radius,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "#ffd62e";

            ctx.fill();


            ctx.strokeStyle =
                "#d79500";

            ctx.lineWidth = 3;

            ctx.stroke();


            ctx.fillStyle =
                "rgba(255,255,255,.65)";

            ctx.beginPath();

            ctx.arc(
                x - 3,
                coin.y - 4,
                3,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
    );

}


// =========================================
// دشمن‌ها
// =========================================

function drawEnemies() {

    enemies.forEach(
        enemy => {

            if (
                !enemy.alive
            ) {

                return;

            }


            const x =
                enemy.x -
                cameraX;

            const y =
                enemy.y;


            // بدن

            ctx.fillStyle =
                "#7545bd";


            ctx.beginPath();

            ctx.ellipse(
                x + 22,
                y + 25,
                23,
                20,
                0,
                0,
                Math.PI * 2
            );

            ctx.fill();


            // چشم

            ctx.fillStyle =
                "white";


            ctx.beginPath();

            ctx.arc(
                x + 14,
                y + 18,
                6,
                0,
                Math.PI * 2
            );

            ctx.arc(
                x + 30,
                y + 18,
                6,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.fillStyle =
                "#222";


            ctx.beginPath();

            ctx.arc(
                x + 14,
                y + 18,
                2,
                0,
                Math.PI * 2
            );

            ctx.arc(
                x + 30,
                y + 18,
                2,
                0,
                Math.PI * 2
            );

            ctx.fill();


            // پا

            ctx.fillStyle =
                "#3c274c";

            ctx.fillRect(
                x + 4,
                y + 38,
                15,
                6
            );

            ctx.fillRect(
                x + 26,
                y + 38,
                15,
                6
            );

        }
    );

}


// =========================================
// گلوله
// =========================================

function drawBullets() {

    bullets.forEach(
        bullet => {

            const x =
                bullet.x -
                cameraX;


            ctx.fillStyle =
                "#ff4a20";


            ctx.beginPath();

            ctx.arc(
                x,
                bullet.y,
                8,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.fillStyle =
                "#ffd43b";


            ctx.beginPath();

            ctx.arc(
                x - 2,
                bullet.y - 2,
                3,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
    );

}


// =========================================
// پرچم
// =========================================

function drawFlag() {

    const x =
        flag.x -
        cameraX;


    ctx.fillStyle =
        "#59371f";

    ctx.fillRect(
        x,
        flag.y,
        8,
        flag.height
    );


    ctx.fillStyle =
        "#e52d3b";


    ctx.beginPath();

    ctx.moveTo(
        x + 8,
        flag.y
    );

    ctx.lineTo(
        x + 58,
        flag.y + 22
    );

    ctx.lineTo(
        x + 8,
        flag.y + 44
    );

    ctx.closePath();

    ctx.fill();

}


// =========================================
// 👧 شخصیت کامل
// =========================================

function drawPlayer() {

    const x =
        player.x -
        cameraX;

    const y =
        player.y;


    // افکت آسیب‌پذیری

    if (
        player.invincible > 0 &&
        Math.floor(
            player.invincible / 6
        ) % 2 === 0
    ) {

        return;

    }


    ctx.save();


    // -----------------------------
    // سایه
    // -----------------------------

    ctx.fillStyle =
        "rgba(0,0,0,.22)";


    ctx.beginPath();

    ctx.ellipse(
        x + 22,
        y + 62,
        23,
        7,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // -----------------------------
    // پاها
    // -----------------------------

    ctx.fillStyle =
        "#3159a5";


    ctx.fillRect(
        x + 7,
        y + 42,
        13,
        18
    );


    ctx.fillRect(
        x + 24,
        y + 42,
        13,
        18
    );


    // -----------------------------
    // کفش‌ها
    // -----------------------------

    ctx.fillStyle =
        "#4a2b20";


    ctx.beginPath();

    ctx.ellipse(
        x + 12,
        y + 60,
        11,
        6,
        0,
        0,
        Math.PI * 2
    );


    ctx.ellipse(
        x + 32,
        y + 60,
        11,
        6,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // -----------------------------
    // بدن
    // -----------------------------

    ctx.fillStyle =
        "#e85d96";


    ctx.beginPath();

    ctx.roundRect(
        x + 7,
        y + 18,
        30,
        29,
        8
    );

    ctx.fill();


    // لباس جلویی

    ctx.fillStyle =
        "#f47cad";

    ctx.fillRect(
        x + 11,
        y + 23,
        22,
        18
    );


    // -----------------------------
    // دست چپ
    // -----------------------------

    ctx.fillStyle =
        "#ffd0a8";


    ctx.beginPath();

    ctx.arc(
        x + 5,
        y + 31,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // -----------------------------
    // دست راست
    // -----------------------------

    ctx.beginPath();

    ctx.arc(
        x + 39,
        y + 31,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // -----------------------------
    // گردن
    // -----------------------------

    ctx.fillStyle =
        "#f1bc91";

    ctx.fillRect(
        x + 17,
        y + 13,
        10,
        10
    );


    // -----------------------------
    // صورت
    // -----------------------------

    ctx.fillStyle =
        "#ffd0a8";


    ctx.beginPath();

    ctx.arc(
        x + 22,
        y + 12,
        17,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // -----------------------------
    // مو
    // -----------------------------

    ctx.fillStyle =
        "#713e28";


    ctx.beginPath();

    ctx.arc(
        x + 22,
        y + 7,
        18,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    // موهای کناری

    ctx.fillRect(
        x + 4,
        y + 7,
        8,
        24
    );

    ctx.fillRect(
        x + 32,
        y + 7,
        8,
        24
    );


    // -----------------------------
    // چشم‌ها
    // -----------------------------

    ctx.fillStyle =
        "#222";


    ctx.beginPath();

    ctx.arc(
        x + 16,
        y + 13,
        2.7,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 28,
        y + 13,
        2.7,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // -----------------------------
    // لبخند
    // -----------------------------

    ctx.strokeStyle =
        "#914d3c";

    ctx.lineWidth = 2;


    ctx.beginPath();

    ctx.arc(
        x + 22,
        y + 16,
        6,
        0.15,
        Math.PI - 0.15
    );

    ctx.stroke();


    // -----------------------------
    // گونه
    // -----------------------------

    ctx.fillStyle =
        "rgba(255,90,110,.35)";


    ctx.beginPath();

    ctx.arc(
        x + 12,
        y + 19,
        4,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 32,
        y + 19,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.restore();

}


// =========================================
// دوربین
// =========================================

function updateCamera() {

    cameraX =
        player.x -
        canvas.width * .35;


    if (
        cameraX < 0
    ) {

        cameraX = 0;

    }


    const max =
        Math.max(
            0,
            world.width -
            canvas.width
        );


    if (
        cameraX > max
    ) {

        cameraX = max;

    }

}


// =========================================
// حلقه بازی
// =========================================

function gameLoop() {

    if (!gameRunning) {

        return;

    }


    if (!paused) {

        updatePlayer();

        updateEnemies();

        updateBullets();

        updateCoins();

        checkEnemyCollision();

        checkFlag();

        updateCamera();

    }


    // پاک کردن

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // رسم

    drawBackground();

    drawPlatforms();

    drawCoins();

    drawEnemies();

    drawBullets();

    drawFlag();

    drawPlayer();


    animationId =
        requestAnimationFrame(
            gameLoop
        );

}


// =========================================
// توقف
// =========================================

document
    .getElementById("pauseBtn")
    .addEventListener(
        "click",
        () => {

            if (!gameRunning) {

                return;

            }

            paused = true;

            showScreen(
                "pauseMenu"
            );

        }
    );


// =========================================
// ادامه
// =========================================

document
    .getElementById("resumeBtn")
    .addEventListener(
        "click",
        () => {

            paused = false;

            showScreen(
                "gameScreen"
            );

            gameLoop();

        }
    );


// =========================================
// شروع دوباره
// =========================================

document
    .getElementById("restartBtn")
    .addEventListener(
        "click",
        () => {

            startGame();

        }
    );


document
    .getElementById("retryBtn")
    .addEventListener(
        "click",
        () => {

            startGame();

        }
    );


// =========================================
// مرحله بعد
// =========================================

document
    .getElementById("nextLevelBtn")
    .addEventListener(
        "click",
        () => {

            if (
                currentLevel < 10
            ) {

                currentLevel++;

                startGame();

            } else {

                showScreen(
                    "worldCompleteMenu"
                );

            }

        }
    );


// =========================================
// جهان بعدی
// =========================================

document
    .getElementById("nextWorldBtn")
    .addEventListener(
        "click",
        () => {

            if (
                currentWorld < 4
            ) {

                currentWorld++;

                currentLevel = 1;

                createLevelButtons();

                showScreen(
                    "levelMenu"
                );

            }

        }
    );


// =========================================
// جلوگیری از اسکرول
// =========================================

document.addEventListener(
    "touchmove",
    event => {

        if (
            event.target.closest(
                "#gameControls"
            )
        ) {

            event.preventDefault();

        }

    },
    {
        passive: false
    }
);


// =========================================
// اجرای اولیه
// =========================================

createLevelButtons();

updateHUD();

showScreen("mainMenu");
