import Phaser from "phaser";

export default class Scene02 extends Phaser.Scene {
  constructor() {
    super({ key: "Scene02" });
    // Declare variables as class properties
    this.ship2 = null;
    this.bullets = null;
    this.Fired = 0;  
    this.score = 0;
    this.scoreText = null;
    this.gameOverText = null;
    this.enemiesDestroyed = 0; 
    this.totalEnemies = 83;   
    this.lives = 3;
    this.livesText = null;
    this.gameOver = false; 
  }
  preload() {
    // Load images and animations
    this.load.image("Moon", "assets/Moon.jpg");
    // Load the map
    this.load.tilemapTiledJSON("map1", "assets/Moon.json");
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('ship2', 'assets/nave2.png');
    this.load.image('returnButton', 'assets/returnButton.png');
    this.load.spritesheet('enemy_3', 'assets/enemy_3.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('enemy_4', 'assets/enemy_4.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('enemy_5', 'assets/enemy_5.png', { frameWidth: 100, frameHeight: 100 });
  }
  create() {
    // Create the map
    const map = this.make.tilemap({ key: "map1" });
    const moon = map.addTilesetImage("Moon", "Moon");
    map.createLayer("Moon", moon);
    const globalScore = this.registry.get('globalScore');
    // Load the ship
    this.ship2 = this.physics.add.image(465, 500, 'ship2');
    this.ship2.setCollideWorldBounds(true);
    this.ship2.body.allowGravity = false;
    // Define the Bullet class
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
    // Bullet group
    this.bullets = this.physics.add.group({
      classType: Bullet,
      maxSize: 40,
      runChildUpdate: true,
    });
    // Player and bullet controls and speed
    this.cursors = this.input.keyboard.createCursorKeys();
    this.speed = Phaser.Math.GetSpeed(500, 1);
    // Set up enemies
    this.enemies = this.physics.add.group();
    this.createEnemies();
    // Collision event between bullets and enemies
    this.physics.add.overlap(this.bullets, this.enemies, this.killEnemy, null, this);
    // Collision event between ship and enemies
    this.physics.add.collider(this.ship2, this.enemies, this.contact, null, this);
    // @ts-ignore
    this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '40px', fontStyle: 'bold', fill: '#fe7945'});
    // @ts-ignore
    this.globalScoreText = this.add.text(20, 70, 'Total: ' + globalScore, { fontSize: '30px',  fontStyle: 'bold', fill: '#e42355'});
     // @ts-ignore
    this.livesText = this.add.text(710, 620, 'Lives: ' + this.lives, {fontSize: '30px', fontStyle: 'bold', fill: '#49fecf' });
  }
  update(time, delta) {
    // Ship movement
    if (this.cursors.left.isDown) {
      this.ship2.x -= this.speed * delta;
    } else if (this.cursors.right.isDown) {
      this.ship2.x += this.speed * delta;
    }
    // Forward and backward movement
    if (this.cursors.up.isDown) {
      // @ts-ignore
      if (this.ship2.y > this.game.config.height / 2) {
        this.ship2.y -= this.speed * delta;
      }
    } else if (this.cursors.down.isDown) {
      if (this.ship2.y < 620) {
        this.ship2.y += this.speed * delta;
      }
    }
    // Firing bullets
    if (this.cursors.space.isDown && time > this.Fired) {
      let bullet = this.bullets.get();
      if (bullet) {
        bullet.fire(this.ship2.x, this.ship2.y);
        bullet.body.allowGravity = false;
        this.Fired = time + 200;
      }
    }
    // Check if any enemies have passed or been destroyed
    this.enemies.getChildren().forEach((enemy) => {
      // @ts-ignore
      if (enemy.active && enemy.y > this.game.config.height) {
        this.enemiesDestroyed++;
        enemy.destroy();
        this.checkScene();
      }
    });
    if (this.enemiesDestroyed >= this.totalEnemies) {
      this.scene.start('Scene03');
    }
  }
  createEnemies() {
    // Generate enemies randomly and mixed
    const enemyTypes = ['enemy_3', 'enemy_4', 'enemy_5'];
    for (let i = 0; i < this.totalEnemies; i++) {
      const enemyType = Phaser.Utils.Array.GetRandom(enemyTypes);
      const x = Phaser.Math.Between(50, 880);
      const y = Phaser.Math.Between(-200, -50);
      const enemy = this.enemies.create(x, y, enemyType);
      enemy.setVelocityY(Phaser.Math.Between(20, 60)); // Adjust vertical speed to be slower
      enemy.body.allowGravity = false;
    }
  }
  killEnemy(bullet, enemy) {
    enemy.disableBody(true, true);
    bullet.setVisible(false);
    bullet.setActive(false);
    this.score += 5;
    this.scoreText.setText('Score: ' + this.score);
    const globalScore = this.registry.get('globalScore') + 5;
    this.registry.set('globalScore', globalScore);
    this.globalScoreText.setText('Total: ' + globalScore);
    this.enemiesDestroyed++;
    this.checkScene();
  }

  contact(ship2) {
    if (this.gameOver) return;
    this.gameOver = true;
    ship2.setTint(0xff0000);
    this.physics.pause();
    this.lives -= 1;
    this.livesText.setText('Lives: ' + this.lives);
    if (this.lives > 0) {
      this.time.delayedCall(1000, () => {
        this.rebootScene();
      });
    } else {
      this.time.delayedCall(1000, () => {
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
    if (this.scoreText) {
      this.scoreText.setText('Score: 0');
    }
    this.scene.start('Scene02');
  }
  rebootPlay() {
    this.lives = 3;
    this.score = 0;
    this.enemiesDestroyed = 0;
    this.registry.set('globalScore', 0);
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
  checkScene() {
    if (this.score >= 400) {
      this.scene.start('Scene03');
    }
    if (this.enemiesDestroyed >= this.totalEnemies) {
      this.scene.start('Scene03');
    }
  }
}
