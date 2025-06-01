import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.sys.game.config;
        this.add.text(width / 2, height / 2 - 100, 'Berry Ninja', {
            fontSize: '64px',
            fill: '#fff',
            fontFamily: 'Arial',
            shadow: { offsetX: 2, offsetY: 2, color: '#b3b3b3', blur: 6, fill: true }
        }).setOrigin(0.5);

        const playButton = this.add.text(width / 2, height / 2, 'Играть', {
            fontSize: '40px',
            fill: '#222',
            backgroundColor: '#e6e6e6',
            padding: { x: 40, y: 16 },
            fontStyle: 'bold',
            fontFamily: 'Arial',
            shadow: { offsetX: 1, offsetY: 1, color: '#fff', blur: 4, fill: true }
        }).setOrigin(0.5).setInteractive();

        playButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        const shopButton = this.add.text(width / 2, height / 2 + 80, 'Магазин', {
            fontSize: '32px',
            fill: '#222',
            backgroundColor: '#e6e6e6',
            padding: { x: 30, y: 12 },
            fontFamily: 'Arial',
            shadow: { offsetX: 1, offsetY: 1, color: '#fff', blur: 4, fill: true }
        }).setOrigin(0.5).setInteractive();

        shopButton.on('pointerdown', () => {
            this.scene.start('ShopScene');
        });
    }
} 