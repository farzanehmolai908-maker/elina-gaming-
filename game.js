/* =====================================================
   🍄 بازی ماجراجویی
   game.js
===================================================== */


const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


/* =====================================================
   اندازه Canvas
===================================================== */

function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;
}

resizeCanvas();

window.addEventListener(
    "resize",
    resizeCanvas
);


/* =====================================================
   وضعیت بازی
===================================================== */

let world = 1;

let level = 1;

let lives = 3;

let coins = 0;

let score = 0;

let cameraX = 0;

let levelFinished = false;


/* =====================================================
   کنترل‌ها
===================================================== */

const input = {

    left: false,

    right: false
};


/* =====================================================
   بازیکن
===================================================== */

const player = {

    x: 120,

    y: 200,

    width: 44,

    height: 72,

    vx: 0,

    vy: 0,

    speed: 5,

    jumpPower: 14,

    direction: 1,

    onGround: false,

    invincible: 0
};


/* =====================================================
   فیزیک
===================================================== */

const gravity = 0.65;


/* =====================================================
   آبجکت‌های مرحله
===================================================== */

let platforms = [];

let enemies = [];

let coinObjects = [];

let bullets = [];

let goal = null;


/* =====================================================
   ساخت مرحله
===================================================== */

function createLevel() {

    platforms = [];

    enemies = [];

    coinObjects = [];

    bullets = [];

    levelFinished = false;

    cameraX = 0;


    player.x = 120;

    player.y =
        canvas.height - 300;

    player.vx = 0;

    player.vy = 0;

    player.invincible = 80;


    /*
       طول مراحل متفاوت است.
    */

    const levelLength =
        3000 +
        level * 250 +
        world * 180;


    /* ==========================================
       زمین اصلی
    ========================================== */

    platforms.push({

        x: 0,

        y: canvas.height - 100,

        width: levelLength,

        height: 100,

        type: "ground"

    });


    /* ==========================================
       الگوی مخصوص هر مرحله
    ========================================== */

    const pattern =
        (level + world) % 5;


    /* ==========================================
       ساخت سکوها
    ========================================== */

    let x = 350;

    let index = 0;


    while (x < levelLength - 450) {

        let y;

        let width;


        /*
           پنج الگوی متفاوت
        */

        if (pattern === 0) {

            y =
                canvas.height -
                190 -
                ((index % 3) * 80);

            width =
                130 +
                ((index * 37) % 100);

        }


        else if (pattern === 1) {

            y =
                canvas.height -
                170 -
                ((index % 2) * 120);

            width =
                100 +
                ((index * 61) % 150);

        }


        else if (pattern === 2) {

            y =
                canvas.height -
                220 -
                (((index * 2) % 4) * 55);

            width =
                150 +
                ((index * 31) % 80);

        }


        else if (pattern === 3) {

            y =
                canvas.height -
                150 -
                ((index % 4) * 70);

            width =
                120 +
                ((index * 43) % 120);

        }


        else {

            y =
                canvas.height -
                200 -
                (((index + world) % 3) * 95);

            width =
                110 +
                ((index * 53) % 130);
        }


        platforms.push({

            x: x,

            y: y,

            width: width,

            height: 28,

            type: "platform"

        });


        /* سکه روی سکو */

        if (index % 2 === 0) {

            coinObjects.push({

                x:
                    x +
                    width / 2,

                y:
                    y - 35,

                radius: 13,

                collected: false

            });
        }


        /* دشمن */

        if (index % 3 === 1) {

            enemies.push({

                x:
                    x +
                    20,

                y:
                    y - 44,

                width: 42,

                height: 44,

                minX:
                    x,

                maxX:
                    x +
                    width -
                    42,

                vx:
                    1 +
                    world * 0.2,

                alive: true

            });
        }


        x +=
            width +
            110 +
            ((index * 47) % 100);

        index++;
    }


    /* ==========================================
       سکه‌های زمین
    ========================================== */

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        coinObjects.push({

            x:
                180 +
                i * 230,

            y:
                canvas.height -
                145,

            radius: 13,

            collected: false

        });
    }


    /* ==========================================
       دشمن‌های زمین
    ========================================== */

    for (
        let i = 0;
        i < 5 + world;
        i++
    ) {

        const enemyX =
            600 +
            i * 480;


        enemies.push({

            x: enemyX,

            y:
                canvas.height -
                144,

            width: 42,

            height: 44,

            minX:
                enemyX - 100,

            maxX:
                enemyX + 100,

            vx:
                1 +
                world * 0.15,

            alive: true

        });
    }


    /* ==========================================
       پرچم پایان
    ========================================== */

    goal = {

        x:
            levelLength - 180,

        y:
            canvas.height - 260,

        width: 80,

        height: 160

    };


    updateHUD();
}


/* =====================================================
   تم دنیا
===================================================== */

function getTheme() {

    if (world === 1) {

        return {

            sky: "#71d2ff",

            ground: "#5b3822",

            groundTop: "#45a83f",

            platform: "#79502e"

        };
    }


    if (world === 2) {

        return {

            sky: "#b9e9ff",

            ground: "#d8f3fa",

            groundTop: "#ffffff",

            platform: "#9ccfe3"

        };
    }


    if (world === 3) {

        return {

            sky: "#168ac4",

            ground: "#155a73",

            groundTop: "#32b6bd",

            platform: "#557f83"

        };
    }


    return {

        sky: "#401a1a",

        ground: "#54201b",

        groundTop: "#d94b24",

        platform: "#70433a"

    };
}


/* =====================================================
   پس‌زمینه
===================================================== */

function drawBackground() {

    const theme =
        getTheme();


    ctx.fillStyle =
        theme.sky;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* کوه‌ها */

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        const x =
            i * 350 -
            ((cameraX * 0.25) % 350);


        ctx.fillStyle =
            world === 4
                ? "#2b1010"
                : "rgba(30,100,100,0.3)";


        ctx.beginPath();

        ctx.moveTo(
            x,
            canvas.height - 100
        );

        ctx.lineTo(
            x + 175,
            canvas.height - 350
        );

        ctx.lineTo(
            x + 350,
            canvas.height - 100
        );

        ctx.closePath();

        ctx.fill();
    }


    /* جنگل */

    if (world === 1) {

        for (
            let i = 0;
            i < 14;
            i++
        ) {

            const x =
                i * 300 -
                ((cameraX * 0.45) % 300);

            drawTree(
                x,
                canvas.height - 100
            );
        }
    }


    /* برف */

    if (world === 2) {

        for (
            let i = 0;
            i < 80;
            i++
        ) {

            const x =
                (i * 137) %
                canvas.width;

            const y =
                (i * 79) %
                (canvas.height - 130);

            ctx.fillStyle =
                "rgba(255,255,255,0.8)";

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                3,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }


    /* آب */

    if (world === 3) {

        for (
            let i = 0;
            i < 35;
            i++
        ) {

            const x =
                (i * 113) %
                canvas.width;

            const y =
                (i * 71) %
                (canvas.height - 130);

            ctx.strokeStyle =
                "rgba(255,255,255,0.35)";

            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                5 + (i % 8),
                0,
                Math.PI * 2
            );

            ctx.stroke();
        }
    }


    /* آتش */

    if (world === 4) {

        for (
            let i = 0;
            i < 15;
            i++
        ) {

            const x =
                i * 280 -
                ((cameraX * 0.25) % 280);

            drawFire(
                x,
                canvas.height - 105
            );
        }
    }
}


/* =====================================================
   درخت
===================================================== */

function drawTree(x, y) {

    ctx.fillStyle =
        "#704126";

    ctx.fillRect(
        x - 12,
        y - 145,
        24,
        145
    );


    ctx.fillStyle =
        "#197b35";


    ctx.beginPath();

    ctx.arc(
        x,
        y - 150,
        55,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        x - 40,
        y - 115,
        42,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        x + 40,
        y - 115,
        42,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


/* =====================================================
   آتش
===================================================== */

function drawFire(x, y) {

    ctx.fillStyle =
        "#ffb000";


    ctx.beginPath();

    ctx.moveTo(x, y);

    ctx.lineTo(
        x + 18,
        y - 55
    );

    ctx.lineTo(
        x + 35,
        y
    );

    ctx.closePath();

    ctx.fill();


    ctx.fillStyle =
        "#ff3b18";


    ctx.beginPath();

    ctx.moveTo(
        x + 8,
        y
    );

    ctx.lineTo(
        x + 20,
        y - 35
    );

    ctx.lineTo(
        x + 32,
        y
    );

    ctx.closePath();

    ctx.fill();
}


/* =====================================================
   زمین
===================================================== */

function drawPlatforms() {

    const theme =
        getTheme();


    for (const p of platforms) {

        const screenX =
            p.x - cameraX;


        if (
            screenX + p.width < 0 ||
            screenX > canvas.width
        ) {

            continue;
        }


        /* بدنه زمین */

        ctx.fillStyle =
            theme.ground;

        ctx.fillRect(
            screenX,
            p.y,
            p.width,
            p.height
        );


        /* قسمت بالای زمین */

        ctx.fillStyle =
            theme.groundTop;

        ctx.fillRect(
            screenX,
            p.y,
            p.width,
            10
        );


        /* بافت زمین */

        if (p.type === "ground") {

            ctx.strokeStyle =
                "rgba(0,0,0,0.18)";

            ctx.lineWidth = 2;


            for (
                let bx = screenX;
                bx < screenX + p.width;
                bx += 45
            ) {

                ctx.beginPath();

                ctx.moveTo(
                    bx,
                    p.y + 12
                );

                ctx.lineTo(
                    bx,
                    p.y + p.height
                );

                ctx.stroke();
            }


            for (
                let by = p.y + 35;
                by < p.y + p.height;
                by += 30
            ) {

                ctx.beginPath();

                ctx.moveTo(
                    screenX,
                    by
                );

                ctx.lineTo(
                    screenX + p.width,
                    by
                );

                ctx.stroke();
            }
        }
    }
}


/* =====================================================
   👧 بازیکن
===================================================== */

function drawPlayer() {

    const x =
        player.x - cameraX;

    const y =
        player.y;


    ctx.save();


    if (player.direction === -1) {

        ctx.translate(
            x + player.width,
            0
        );

        ctx.scale(-1, 1);

    } else {

        ctx.translate(
            x,
            0
        );
    }


    /* سایه */

    ctx.fillStyle =
        "rgba(0,0,0,0.2)";

    ctx.beginPath();

    ctx.ellipse(
        22,
        y + 73,
        22,
        5,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* پاها */

    ctx.fillStyle =
        "#ffd0aa";


    ctx.fillRect(
        13,
        y + 49,
        8,
        17
    );


    ctx.fillRect(
        27,
        y + 49,
        8,
        17
    );


    /* کفش */

    ctx.fillStyle =
        "#40251f";


    ctx.fillRect(
        8,
        y + 64,
        16,
        7
    );


    ctx.fillRect(
        26,
        y + 64,
        16,
        7
    );


    /* دامن */

    ctx.fillStyle =
        "#e34d69";


    ctx.beginPath();

    ctx.moveTo(
        8,
        y + 37
    );

    ctx.lineTo(
        37,
        y + 37
    );

    ctx.lineTo(
        42,
        y + 57
    );

    ctx.lineTo(
        5,
        y + 57
    );

    ctx.closePath();

    ctx.fill();


    /* بدن */

    ctx.fillStyle =
        "#4e8fe7";


    ctx.beginPath();

    ctx.roundRect(
        10,
        y + 27,
        26,
        25,
        6
    );

    ctx.fill();


    /* دست چپ */

    ctx.fillStyle =
        "#ffd0aa";


    ctx.fillRect(
        2,
        y + 30,
        9,
        21
    );


    /* دست راست */

    ctx.fillRect(
        35,
        y + 30,
        9,
        21
    );


    /* گردن */

    ctx.fillRect(
        17,
        y + 21,
        9,
        9
    );


    /* سر */

    ctx.beginPath();

    ctx.arc(
        21,
        y + 15,
        17,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* مو */

    ctx.fillStyle =
        "#5a2d22";


    ctx.beginPath();

    ctx.arc(
        21,
        y + 9,
        18,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    /* موهای کناری */

    ctx.fillRect(
        3,
        y + 8,
        7,
        22
    );


    ctx.fillRect(
        32,
        y + 8,
        7,
        22
    );


    /* چشم‌ها */

    ctx.fillStyle =
        "#222";


    ctx.beginPath();

    ctx.arc(
        15,
        y + 16,
        2.2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        27,
        y + 16,
        2.2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* لب */

    ctx.strokeStyle =
        "#a54848";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        21,
        y + 19,
        5,
        0,
        Math.PI
    );

    ctx.stroke();


    ctx.restore();
}


/* =====================================================
   🪙 سکه
===================================================== */

function drawCoins() {

    for (const coin of coinObjects) {

        if (coin.collected) {
            continue;
        }


        const x =
            coin.x - cameraX;


        if (
            x < -30 ||
            x > canvas.width + 30
        ) {

            continue;
        }


        ctx.fillStyle =
            "#ffd52e";


        ctx.beginPath();

        ctx.arc(
            x,
            coin.y,
            coin.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.strokeStyle =
            "#b98000";

        ctx.lineWidth = 3;

        ctx.stroke();


        ctx.fillStyle =
            "#fff2a0";

        ctx.font =
            "bold 14px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "$",
            x,
            coin.y + 5
        );
    }
}


/* =====================================================
   دشمن
===================================================== */

function drawEnemies() {

    for (const enemy of enemies) {

        if (!enemy.alive) {
            continue;
        }


        const x =
            enemy.x - cameraX;

        const y =
            enemy.y;


        /* بدن */

        if (world === 2) {

            ctx.fillStyle =
                "#ffffff";

        } else if (world === 3) {

            ctx.fillStyle =
                "#ed7d38";

        } else if (world === 4) {

            ctx.fillStyle =
                "#d93422";

        } else {

            ctx.fillStyle =
                "#6b4528";
        }


        ctx.beginPath();

        ctx.roundRect(
            x,
            y,
            enemy.width,
            enemy.height,
            12
        );

        ctx.fill();


        /* چشم‌ها */

        ctx.fillStyle =
            "white";


        ctx.beginPath();

        ctx.arc(
            x + 12,
            y + 13,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.beginPath();

        ctx.arc(
            x + 29,
            y + 13,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            "#222";


        ctx.beginPath();

        ctx.arc(
            x + 12,
            y + 13,
            2,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.beginPath();

        ctx.arc(
            x + 29,
            y + 13,
            2,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /* پاها */

        ctx.fillStyle =
            "#38251d";


        ctx.fillRect(
            x + 5,
            y + 36,
            10,
            8
        );


        ctx.fillRect(
            x + 27,
            y + 36,
            10,
            8
        );
    }
}


/* =====================================================
   🚩 پرچم
===================================================== */

function drawGoal() {

    const x =
        goal.x - cameraX;


    /* میله */

    ctx.fillStyle =
        "#777";


    ctx.fillRect(
        x + 25,
        goal.y,
        8,
        goal.height
    );


    /* پایه */

    ctx.fillStyle =
        "#444";


    ctx.fillRect(
        x + 5,
        goal.y + goal.height - 8,
        48,
        10
    );


    /* توپ */

    ctx.fillStyle =
        "#ffd42e";


    ctx.beginPath();

    ctx.arc(
        x + 29,
        goal.y,
        9,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* پرچم */

    ctx.fillStyle =
        world === 4
            ? "#ff3d30"
            : "#22b84b";


    ctx.beginPath();

    ctx.moveTo(
        x + 33,
        goal.y + 12
    );

    ctx.lineTo(
        x + 92,
        goal.y + 38
    );

    ctx.lineTo(
        x + 33,
        goal.y + 65
    );

    ctx.closePath();

    ctx.fill();


    /* ستاره */

    ctx.fillStyle =
        "#fff";

    ctx.font =
        "25px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "★",
        x + 55,
        goal.y + 47
    );
}


/* =====================================================
   حرکت بازیکن
===================================================== */

function updatePlayer() {

    player.vx = 0;


    if (input.left) {

        player.vx =
            -player.speed;

        player.direction =
            -1;
    }


    if (input.right) {

        player.vx =
            player.speed;

        player.direction =
            1;
    }


    player.x +=
        player.vx;


    if (player.x < 0) {

        player.x = 0;
    }


    /* جاذبه */

    player.vy +=
        gravity;

    player.y +=
        player.vy;


    player.onGround =
        false;


    /* برخورد با زمین و سکو */

    for (const p of platforms) {

        if (

            player.x +
                player.width >
                p.x &&

            player.x <
                p.x + p.width &&

            player.y +
                player.height >=
                p.y &&

            player.y +
                player.height <=
                p.y +
                p.height +
                15 &&

            player.vy >= 0

        ) {

            player.y =
                p.y -
                player.height;

            player.vy = 0;

            player.onGround =
                true;
        }
    }


    /* افتادن */

    if (
        player.y >
        canvas.height + 150
    ) {

        loseLife();

        return;
    }


    /* دوربین */

    const targetCamera =
        player.x -
        canvas.width * 0.38;


    cameraX +=
        (targetCamera - cameraX) *
        0.1;


    if (cameraX < 0) {

        cameraX = 0;
    }
}


/* =====================================================
   پرش
===================================================== */

function jump() {

    if (
        player.onGround &&
        !levelFinished
    ) {

        player.vy =
            -player.jumpPower;
    }
}


/* =====================================================
   تیراندازی
===================================================== */

function shoot() {

    if (levelFinished) {
        return;
    }


    bullets.push({

        x:
            player.x +
            (
                player.direction === 1
                    ? player.width
                    : 0
            ),

        y:
            player.y + 30,

        vx:
            player.direction * 10

    });
}


/* =====================================================
   گلوله‌ها
===================================================== */

function updateBullets() {

    for (const bullet of bullets) {

        bullet.x +=
            bullet.vx;
    }


    bullets =
        bullets.filter(
            bullet =>
                bullet.x >
                    cameraX - 300 &&

                bullet.x <
                    cameraX +
                    canvas.width +
                    300
        );


    for (const bullet of bullets) {

        for (const enemy of enemies) {

            if (!enemy.alive) {
                continue;
            }


            if (

                bullet.x >
                    enemy.x &&

                bullet.x <
                    enemy.x +
                    enemy.width &&

                bullet.y >
                    enemy.y &&

                bullet.y <
                    enemy.y +
                    enemy.height

            ) {

                enemy.alive =
                    false;

                score += 100;
            }
        }
    }
}


/* =====================================================
   دشمن‌ها
===================================================== */

function updateEnemies() {

    for (const enemy of enemies) {

        if (!enemy.alive) {
            continue;
        }


        enemy.x +=
            enemy.vx;


        if (
            enemy.x <
                enemy.minX ||

            enemy.x >
                enemy.maxX
        ) {

            enemy.vx *= -1;
        }


        /* برخورد */

        if (
            player.invincible <= 0 &&

            player.x <
                enemy.x +
                enemy.width &&

            player.x +
                player.width >
                enemy.x &&

            player.y <
                enemy.y +
                enemy.height &&

            player.y +
                player.height >
                enemy.y
        ) {

            /* پرش روی دشمن */

            if (player.vy > 2) {

                enemy.alive =
                    false;

                player.vy =
                    -9;

                score += 150;

            } else {

                loseLife();
            }
        }
    }


    if (
        player.invincible > 0
    ) {

        player.invincible--;
    }
}


/* =====================================================
   سکه‌ها
===================================================== */

function updateCoins() {

    for (const coin of coinObjects) {

        if (coin.collected) {
            continue;
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


        if (distance < 35) {

            coin.collected =
                true;

            coins++;

            score += 50;

            updateHUD();
        }
    }
}


/* =====================================================
   بررسی پرچم
===================================================== */

function checkGoal() {

    if (

        player.x +
            player.width >
            goal.x &&

        player.x <
            goal.x +
            goal.width

    ) {

        finishLevel();
    }
}


/* =====================================================
   پایان مرحله
===================================================== */

function finishLevel() {

    if (levelFinished) {
        return;
    }


    levelFinished =
        true;


    document
        .getElementById(
            "resultText"
        )
        .textContent =
        `دنیا ${world} - مرحله ${level} را تمام کردی!`;


    document
        .getElementById(
            "levelComplete"
        )
        .classList
        .remove("hidden");
}


/* =====================================================
   مرحله بعد
===================================================== */

document
    .getElementById("nextBtn")
    .addEventListener(
        "click",
        () => {

            level++;


            /*
               هر دنیا ۱۰ مرحله
            */

            if (level > 10) {

                level = 1;

                world++;


                /*
                   بعد از دنیای چهارم
                */

                if (world > 4) {

                    world = 1;

                    alert(
                        "🎉 تبریک! هر ۴ دنیا را تمام کردی!"
                    );
                }
            }


            document
                .getElementById(
                    "levelComplete"
                )
                .classList
                .add("hidden");


            createLevel();
        }
    );


/* =====================================================
   کم شدن جان
===================================================== */

function loseLife() {

    if (levelFinished) {
        return;
    }


    lives--;

    updateHUD();


    if (lives <= 0) {

        document
            .getElementById(
                "gameOver"
            )
            .classList
            .remove("hidden");

        return;
    }


    player.x = 120;

    player.y =
        canvas.height - 300;

    player.vx = 0;

    player.vy = 0;

    player.invincible = 100;

    cameraX = 0;
}


/* =====================================================
   شروع دوباره
===================================================== */

document
    .getElementById("restartBtn")
    .addEventListener(
        "click",
        () => {

            lives = 3;

            score = 0;

            coins = 0;

            world = 1;

            level = 1;


            document
                .getElementById(
                    "gameOver"
                )
                .classList
                .add("hidden");


            createLevel();
        }
    );


/* =====================================================
   HUD
===================================================== */

function updateHUD() {

    document
        .getElementById("lives")
        .textContent =
        lives;


    document
        .getElementById("coins")
        .textContent =
        coins;


    document
        .getElementById("score")
        .textContent =
        score;


    document
        .getElementById("world")
        .textContent =
        world;


    document
        .getElementById("level")
        .textContent =
        level;
}


/* =====================================================
   کنترل کیبورد
===================================================== */

window.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "ArrowLeft"
        ) {

            input.left = true;
        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            input.right = true;
        }


        if (
            event.key ===
            "ArrowUp" ||

            event.key ===
            " "
        ) {

            event.preventDefault();

            jump();
        }


        if (
            event.key.toLowerCase() ===
            "f"
        ) {

            shoot();
        }
    }
);


window.addEventListener(
    "keyup",
    event => {

        if (
            event.key ===
            "ArrowLeft"
        ) {

            input.left = false;
        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            input.right = false;
        }
    }
);


/* =====================================================
   کنترل لمسی
===================================================== */

function holdButton(
    element,
    down,
    up
) {

    element.addEventListener(
        "touchstart",
        event => {

            event.preventDefault();

            element.classList.add(
                "pressed"
            );

            down();
        },
        {
            passive: false
        }
    );


    element.addEventListener(
        "touchend",
        event => {

            event.preventDefault();

            element.classList.remove(
                "pressed"
            );

            up();
        },
        {
            passive: false
        }
    );


    element.addEventListener(
        "touchcancel",
        () => {

            element.classList.remove(
                "pressed"
            );

            up();
        }
    );


    element.addEventListener(
        "mousedown",
        event => {

            event.preventDefault();

            element.classList.add(
                "pressed"
            );

            down();
        }
    );


    element.addEventListener(
        "mouseup",
        () => {

            element.classList.remove(
                "pressed"
            );

            up();
        }
    );


    element.addEventListener(
        "mouseleave",
        () => {

            element.classList.remove(
                "pressed"
            );

            up();
        }
    );
}


/* چپ */

holdButton(

    document.getElementById(
        "leftBtn"
    ),

    () => {
        input.left = true;
    },

    () => {
        input.left = false;
    }
);


/* راست */

holdButton(

    document.getElementById(
        "rightBtn"
    ),

    () => {
        input.right = true;
    },

    () => {
        input.right = false;
    }
);


/* پرش */

document
    .getElementById("jumpBtn")
    .addEventListener(
        "touchstart",
        event => {

            event.preventDefault();

            jump();
        },
        {
            passive: false
        }
    );


document
    .getElementById("jumpBtn")
    .addEventListener(
        "mousedown",
        jump
    );


/* تیر */

document
    .getElementById("shootBtn")
    .addEventListener(
        "touchstart",
        event => {

            event.preventDefault();

            shoot();
        },
        {
            passive: false
        }
    );


document
    .getElementById("shootBtn")
    .addEventListener(
        "mousedown",
        shoot
    );


/* =====================================================
   حلقه اصلی
===================================================== */

function gameLoop() {

    updatePlayer();

    updateEnemies();

    updateBullets();

    updateCoins();

    checkGoal();


    drawBackground();

    drawPlatforms();

    drawCoins();

    drawEnemies();

    drawGoal();

    drawBullets();

    drawPlayer();


    requestAnimationFrame(
        gameLoop
    );
}


/* =====================================================
   شروع بازی
===================================================== */

createLevel();

gameLoop();
