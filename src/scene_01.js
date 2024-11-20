import Phaser from "phaser";

export default class Scene01 extends Phaser.Scene {
  constructor() {
    super({ key: "Scene01" });
    // Declare variables as class properties
    this.ship = null;
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
    this.load.image("Wallpaper", "assets/Wallpaper.jpg");
    // Load the map
    this.load.tilemapTiledJSON("map", "assets/Wallpaper.json");
    this.load.audio('tone', 'assets/song.mp3');
    this.load.image('bullet', 'assets/bala.png');
    this.load.image('ship', 'assets/nave.png');
    this.load.image('returnButton', 'assets/returnButton.png');
    this.load.spritesheet('enemy_0', 'assets/enemy_0.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('enemy_1', 'assets/enemy_1.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('enemy_2', 'assets/enemy_2.png', { frameWidth: 100, frameHeight: 100 });
  }
  create() {
    // Create the map
    const map = this.make.tilemap({ key: "map" });
    const wallpaper = map.addTilesetImage("Wallpaper", "Wallpaper");
    map.createLayer("Wallpaper", wallpaper);
    this.sound.stopAll();
    const jungle = this.sound.add('tone');
    jungle.play({
      loop: true
    });
    if (!this.registry.get('globalScore')) {
      this.registry.set('globalScore', 0);
    }
    // Load the ship
    this.ship = this.physics.add.image(465, 500, 'ship');
    this.ship.setCollideWorldBounds(true);
    this.ship.body.allowGravity = false;
    // Define the Bullet class
    // @ts-ignore
    let Bullet = new Phaser.Class({
      Extends: Phaser.GameObjects.Image,
      initialize:
        function Bullet(scene) {
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
    this.physics.add.collider(this.ship, this.enemies, this.contact, null, this);
    // @ts-ignore
    this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '40px', fontStyle: 'bold', fill: '#fe7945' });
    // @ts-ignore
    this.globalScoreText = this.add.text(20, 70, 'Total: ' + this.registry.get('globalScore'), { fontSize: '30px',  fontStyle: 'bold', fill: '#e42355' });
    // @ts-ignore
    this.livesText = this.add.text(710, 620, 'Lives: ' + this.lives, { fontSize: '30px', fontStyle: 'bold', fill: '#49fecf' });
    this.gameOver = false;
  }

  update(time, delta) {
    // Ship movement
    if (this.cursors.left.isDown) {
      this.ship.x -= this.speed * delta;
    } else if (this.cursors.right.isDown) {
      this.ship.x += this.speed * delta;
    }
    // Forward and backward movement
    if (this.cursors.up.isDown) {
      // Limit forward movement so it doesn't pass the middle of the screen
      // @ts-ignore
      if (this.ship.y > this.game.config.height / 2) {
        this.ship.y -= this.speed * delta;
      }
    } else if (this.cursors.down.isDown) {
      // Allow backward movement up to the original position
      if (this.ship.y < 620) {
        this.ship.y += this.speed * delta;
      }
    }
    if (this.cursors.space.isDown && time > this.Fired) {
      let bullet = this.bullets.get();
      if (bullet) {
        bullet.fire(this.ship.x, this.ship.y);
        bullet.body.allowGravity = false;
        this.Fired = time + 200;
      }
    }
    this.enemies.getChildren().forEach((enemy) => {
      // Make sure 'enemy' is a valid Phaser object
      // @ts-ignore
      if (enemy.active && enemy.y > this.game.config.height) {
        this.enemiesDestroyed++;
        enemy.destroy(); // Destroy enemy
        this.checkScene();
      }
    });
    // Constantly check if all enemies have been destroyed or passed
    if (this.enemiesDestroyed >= this.totalEnemies) {
      this.scene.start('Scene02');
    }
  }
  createEnemies() {
    // Generate enemies randomly and mixed
    const enemyTypes = ['enemy_0', 'enemy_1', 'enemy_2'];
    for (let i = 0; i < this.totalEnemies; i++) { // Adjust the total number of enemies
      const enemyType = Phaser.Utils.Array.GetRandom(enemyTypes);
      const x = Phaser.Math.Between(50, 880); // Adjust X limits so they don't go off-screen
      const y = Phaser.Math.Between(-200, -50); // Place enemies off-screen initially
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
    // Update global score in `this.registry`
    const globalScore = this.registry.get('globalScore') + 5;
    this.registry.set('globalScore', globalScore);
    this.globalScoreText.setText('Total: ' + globalScore);
    this.enemiesDestroyed++;
    this.checkScene();
  }
  contact(ship) {
    if (this.gameOver) return;
    this.gameOver = true;
    ship.setTint(0xff0000);
    this.physics.pause();
    this.lives -= 1;
    this.livesText.setText('Lives: ' + this.lives);
    if (this.lives > 0) {
      // Restart the current scene if lives remain
      this.time.delayedCall(1000, () => {
        this.rebootScene();  // Call a function that restarts the scene
      });
    } else {
      // If no lives remain, go to the start scene (Scene00)
      this.time.delayedCall(1000, () => {
        //  this.rebootPlay();  // Call a function that restarts the game and lives

        // Show "Game Over" text
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
    // Reset specific scene variables, but keep the lives
    this.score = 0;
    this.enemiesDestroyed = 0;
    this.gameOver = false;
    // Update scene texts
    if (this.scoreText) {
      this.scoreText.setText('Score: 0');
    }
    this.scene.start('Scene01');
  }
  rebootPlay() {
    this.lives = 3;
    this.score = 0;
    this.enemiesDestroyed = 0;
    // Reset global score if necessary
    this.registry.set('globalScore', 0);
    this.registry.set('lives', 3);
    this.gameOver = false;

    // Update score text to reflect the reset
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
    // Check if the score is enough to move to the next level
    if (this.score >= 400) {
      this.scene.start('Scene02');
    }
    // Check if all enemies have been destroyed or passed the screen
    if (this.enemiesDestroyed >= this.totalEnemies) {
      this.scene.start('Scene02');
    }
  }
}
