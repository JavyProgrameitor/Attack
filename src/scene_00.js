import Phaser from "phaser";

export default class Scene00 extends Phaser.Scene {
  constructor() {
    super({ key: "Scene00" });
  }

  preload() {
    // Load images and animations
    this.load.image("Spaceship", "assets/Spaceship.jpg");
    this.load.image("button", "assets/button.png"); 
    this.load.image("arrow", "assets/arrow.png")
    this.load.tilemapTiledJSON("map0", "assets/Spaceship.json");
  }

  create() {
    // Create the map
    const map = this.make.tilemap({ key: "map0" });
    const spaceship = map.addTilesetImage("Spaceship", "Spaceship");
    map.createLayer("Spaceship", spaceship);

    this.rebootPlay();
    // Add text with game instructions
    this.add.text(200, 50, "Game instructions:", {
      fontSize: "40px",
      fontStyle: "bold",
      // @ts-ignore
      fill: "#e42355"
    });
    this.add.text(200, 110, "-- Use the arrows to move left and right.", {
      fontSize: "20px",
      fontStyle: "bold",
      // @ts-ignore
      fill: "#070707"
    });
    this.add.text(200, 160, "-- Also up and down.", {
      fontSize: "20px",
      fontStyle: "bold",
      // @ts-ignore
      fill: "#070707"
    });
    this.add.text(200, 190, "-- Press space bar to shoot.", {
      fontSize: "20px",
      fontStyle: "bold",
      // @ts-ignore
      fill: "#070707"
    });

     // Add button
     const arrow = this.add.image(650, 190, "arrow").setInteractive();
     // Add functionality to the button
     arrow.on("pointerdown", () => {
       this.scene.start("Scene01");
     });

    this.add.text(200, 250, "-- Do not collide with enemies.", {
      fontSize: "20px",
      fontStyle: "bold",
      // @ts-ignore
      fill: "#fe7945"
    });
    // Add "Insert Coin" text in arcade style
    const insertCoinText = this.add.text(300, 300, "INSERT COIN", {
      fontSize: "60px",
      // @ts-ignore
      fill: "#e42355",
      fontStyle: "bold"
    });
    // Blinking animation for "Insert Coin"
    this.tweens.add({
      targets: insertCoinText,
      alpha: 0,
      ease: "Linear",
      duration: 500,
      yoyo: true,
      repeat: -1 // -1 makes it repeat indefinitely
    });
    // Add button
    const button = this.add.image(450, 500, "button").setInteractive();
    // Add functionality to the button
    button.on("pointerdown", () => {
      this.scene.start("Scene01");
    });
  }
  update() {
  }
  rebootPlay() {
    // Reset all global variables
    this.registry.set('globalScore', 0);
    this.registry.set('lives', 3)
  }
}
