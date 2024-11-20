import Phaser from "phaser";

export default class Scene03 extends Phaser.Scene {
  constructor() {
    super({ key: "Scene03" });
    // Declare the variables as class properties
    this.ship3 = null;
    this.bullets = null;
    this.Fired = 0;
    this.gameOverText = null;
    this.bigEnemy = null;
    this.score = 0;
    this.lives = 3;
    this.livesText = null;
    this.gameOver = false; 
  }
  preload() {
    this.load.image("Nebula", "assets/Nebula.jpg");
    this.load.tilemapTiledJSON("map2", "assets/Nebula.json");
    this.load.audio('tone2', 'assets/song2.mp3');
    this.load.audio('tone3', 'assets/song3.wav');
    this.load.image('bullet', 'assets/bala.png');
    this.load.image('ship3', 'assets/nave3.png');
    this.load.image('returnButton', 'assets/returnButton.png');
    this.load.spritesheet('bigEnemy', 'assets/enemyBig.png', { frameWidth: 100, frameHeight: 100 });
  }
  create() {
    const map = this.make.tilemap({ key: "map2" });
    const nebula = map.addTilesetImage("Nebula", "Nebula");
    map.createLayer("Nebula", nebula);
    this.sound.stopAll();
    const jungle = this.sound.add('tone2');
    jungle.play({
      loop: true
    });
    const globalScore = this.registry.get('globalScore');
    this.ship3 = this.physics.add.image(465, 500, 'ship3');
    this.ship3.setCollideWorldBounds(true);
    this.ship3.body.allowGravity = false;
    // @ts-ignore
    let Bullet = new Phaser.Class({
      Extends: Phaser.GameObjects.Image,
      initialize: function Bullet(scene) {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
        this.speed = Phaser.Math.GetSpeed(500, 1);
      },
      fire: function (x, y) {
        this.setPosition(x, y - 50);
        this.setActive(true);
        this.setVisible(true);
      },
      update: function (time, delta) {
        this.y -= this.speed * delta;
        if (this.y < -50) {
          this.setActive(false);
          this.setVisible(false);
        }
      }
    });
    this.bullets = this.physics.add.group({
      classType: Bullet,
      maxSize: 40,
      runChildUpdate: true,
    });
    this.cursors = this.input.keyboard.createCursorKeys();
    this.speed = Phaser.Math.GetSpeed(500, 1);
    this.createBigEnemy();
    this.physics.add.overlap(this.bullets, this.bigEnemy, this.killEnemy, null, this);
    this.physics.add.collider(this.ship3, this.bigEnemy, this.contact, null, this);
    // @ts-ignore
    this.scoreText = this.add.text(20, 20, 'Score: 0', {fontSize: '40px', fontStyle: 'bold', fill: '#fe7945'});
    // @ts-ignore
    this.globalScoreText = this.add.text(20, 70, 'Total: ' + globalScore, {fontSize: '30px',  fontStyle: 'bold', fill: '#e42355'});
    // @ts-ignore
    this.livesText = this.add.text(710, 620, 'Lives: ' + this.lives, {fontSize: '30px', fontStyle: 'bold', fill: '#49fecf' });
  }

  update(time, delta) {
    if (this.gameOver) return; // If the game is over, do not process further updates
    if (this.cursors.left.isDown) {
      this.ship3.x -= this.speed * delta;
    } else if (this.cursors.right.isDown) {
      this.ship3.x += this.speed * delta;
    }
    // Movement forward and backward
    if (this.cursors.up.isDown) {
      // Limit forward movement so it doesn't cross the screen's halfway point
      // @ts-ignore
      if (this.ship3.y > this.game.config.height / 2) {
        this.ship3.y -= this.speed * delta;
      }
    } else if (this.cursors.down.isDown) {
      // Allow backward movement to the original position
      if (this.ship3.y < 620) {
        this.ship3.y += this.speed * delta;
      }
    }
    // Bullet shooting
    if (this.cursors.space.isDown && time > this.Fired) {
      let bullet = this.bullets.get();
      if (bullet) {
        bullet.fire(this.ship3.x, this.ship3.y);
        bullet.body.allowGravity = false;
        this.Fired = time + 200;
      }
    }
    this.upMove(delta);

    // @ts-ignore
    if (this.bigEnemy && this.bigEnemy.y > this.game.config.height) {
      this.lives--; // Lose a life
      this.livesText.setText('Lives: ' + this.lives);

      if (this.lives <= 0) {
         // if not live
         this.gameOver = true;
         this.physics.pause();
         this.sound.stopAll();

        this.gameOverText = this.add.text(450, 300, 'GAME OVER', {
          fontSize: '75px',
          fontStyle: 'bold',
          // @ts-ignore
          fill: '#ff0000'
        }).setOrigin(0.5);
        const returnButton = this.add.image(450, 500, 'returnButton').setInteractive();
        returnButton.on('pointerdown', () => {
          window.location.reload();
          this.scene.start('Scene00');
        });
      } else {
          // if live
          this.rebootScene();
      }
  }


  }
  createBigEnemy() {
    const initialX = Phaser.Math.Between(100, 800);
    const initialY = 50;
    this.bigEnemy = this.physics.add.sprite(initialX, initialY, 'bigEnemy');
    // @ts-ignore
    this.bigEnemy.hitCount = 0; // Initialize the hit counter
    // @ts-ignore
    this.bigEnemy.orbitRadius = 150;
    // @ts-ignore
    this.bigEnemy.orbitSpeed = 0.01;
    this.add.existing(this.bigEnemy);
    this.physics.add.existing(this.bigEnemy);
    this.bigEnemy.body.allowGravity = false;
  }
  upMove(delta) {
    if (this.bigEnemy) {
      // @ts-ignore
      this.bigEnemy.angleOffset = (this.bigEnemy.angleOffset || 0) + this.bigEnemy.orbitSpeed * delta;
      // @ts-ignore
      this.bigEnemy.x = 500 + this.bigEnemy.orbitRadius * Math.cos(this.bigEnemy.angleOffset);
      this.bigEnemy.y += 0.4;
    }
  }
  killEnemy(bullet, bigEnemy) {
    if (this.gameOver) return;
    bullet.setVisible(true);
    bullet.setActive(false);
    this.score += 5;
    this.scoreText.setText('Score: ' + this.score);
    const globalScore = this.registry.get('globalScore') + 5;
    this.registry.set('globalScore', globalScore);
    this.globalScoreText.setText('Total: ' + globalScore);
    if (this.score >= 2300) {
      bigEnemy.destroy();
      this.showVictory();
    }
  }
  contact(ship3) {
    if (this.gameOver) return;
    this.gameOver = true;
    ship3.setTint(0xff0000);
    this.physics.pause();
    this.lives -= 1;
    this.livesText.setText('Lives: ' + this.lives)
    if (this.lives > 0) {
      // Restart the current scene if there are still lives left
      this.time.delayedCall(1000, () => {
        this.rebootScene();  // Call a function that restarts the scene
      });
    } else {
      // If no lives are left, go to the start scene (Scene00)
      this.time.delayedCall(1000, () => {
        this.sound.stopAll();
        this.gameOverText = this.add.text(450, 300, 'GAME OVER', {
          fontSize: '75px',
          fontStyle: 'bold',
          // @ts-ignore
          fill: '#ff0000'
        }).setOrigin(0.5);
        const returnButton = this.add.image(450, 500, 'returnButton').setInteractive();
        returnButton.on('pointerdown', () => {
          this.rebootPlay();
          window.location.reload();
          this.scene.start('Scene00');
        });
      });
    }
  }
  rebootScene() {
    this.score = 0;
    this.enemiesDestroyed = 0;
    this.gameOver = false;
    // Update the scene texts
    if (this.scoreText) {
      this.scoreText.setText('Score: 0');
    }
    this.scene.start('Scene03');
  }
  rebootPlay() {
    this.lives = 3;
    this.score = 0;
    this.enemiesDestroyed = 0;
    // Reset global score if necessary
    this.registry.set('globalScore', 0);
    // Update the score text to reflect the reset
    if (this.scoreText) {
      this.scoreText.setText('Score: 0');
    }
    if (this.globalScoreText) {
      this.globalScoreText.setText('Total: 0');
    }
    if (this.livesText) {
      this.livesText.setText('Lives: 3');
    }
  }
  showVictory() {
    if (this.gameOver) return; 
    const globalScore = this.registry.get('globalScore');
    const victory = this.add.text(400, 200, 'VICTORY! Your Record: ' + globalScore, {
      fontSize: '40px',
      fontStyle: 'bold',
      // @ts-ignore
      fill: '#00ff00'
    }).setOrigin(0.5);
    this.tweens.add({
      targets: victory,
      alpha: 0,
      ease: "Linear",
      duration: 500,
      yoyo: true,
      repeat: -1 // -1 makes it repeat indefinitely
    });
    this.gameOver = true;
    this.physics.pause();
    this.sound.stopAll();
    const jungle = this.sound.add('tone3');
    jungle.play({
      loop: true
    });
    // Create a button to play again
    const startButton = this.add.text(450, 450, 'Play Again', {
      fontSize: '50px',
      // @ts-ignore
      fill: '#ea550b',
    }).setOrigin(0.5).setInteractive();
    // Event to return to the start screen
    startButton.on('pointerdown', () => {
      this.rebootPlay();
      window.location.reload();
      this.scene.start('Scene00');
    });
  }
}
