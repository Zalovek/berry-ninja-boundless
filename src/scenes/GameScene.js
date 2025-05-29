import Phaser from 'phaser';
import { skins } from '../data/skins';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
        this.lives = 3;
        this.selectedSkin = 'default';
        this.berries = [];
        this.slashes = [];
    }

    preload() {
        // Загружаем фон
        this.load.image('background', 'assets/background.png');
        
        // Загружаем все скины
        Object.values(skins).forEach(skin => {
            skin.assets.forEach(asset => {
                this.load.image(asset, `assets/${asset}.png`);
            });
        });
        
        // Загружаем бомбу
        this.load.image('virus', 'assets/virus.gif');
    }

    create() {
        // Добавляем фон
        this.add.image(400, 300, 'background').setScale(1.5);

        // Создаем UI
        this.scoreText = this.add.text(16, 16, 'Счет: 0', {
            fontSize: '32px',
            fill: '#fff'
        });

        this.livesText = this.add.text(16, 56, 'Жизни: 3', {
            fontSize: '32px',
            fill: '#fff'
        });

        // Кнопка магазина
        const shopButton = this.add.text(700, 16, '🛍️', {
            fontSize: '32px',
            fill: '#fff'
        }).setInteractive();

        shopButton.on('pointerdown', () => {
            this.scene.start('ShopScene');
        });

        // Добавляем обработчик кликов
        this.input.on('pointerdown', this.handleSlice, this);

        // Запускаем таймер появления ягод
        this.time.addEvent({
            delay: 1000,
            callback: this.spawnBerry,
            callbackScope: this,
            loop: true
        });
    }

    update() {
        // Обновляем позиции ягод
        this.berries.forEach(berry => {
            berry.y += berry.speed;
            
            // Если ягода упала за пределы экрана
            if (berry.y > 600) {
                berry.destroy();
                this.berries = this.berries.filter(b => b !== berry);
                this.lives--;
                this.livesText.setText(`Жизни: ${this.lives}`);
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });

        // Обновляем следы от разрезания
        this.slashes.forEach(slash => {
            slash.alpha -= 0.02;
            if (slash.alpha <= 0) {
                slash.destroy();
                this.slashes = this.slashes.filter(s => s !== slash);
            }
        });
    }

    spawnBerry() {
        const x = Phaser.Math.Between(100, 700);
        const skin = skins[this.selectedSkin];
        const berryAsset = Phaser.Utils.Array.GetRandom(skin.assets);
        
        const berry = this.add.image(x, -50, berryAsset);
        berry.speed = Phaser.Math.Between(3, 6);
        berry.setScale(0.5);
        
        this.berries.push(berry);
    }

    handleSlice(pointer) {
        // Создаем след от разрезания
        const slash = this.add.line(
            pointer.x,
            pointer.y,
            0, 0,
            50, 0,
            0xffffff
        );
        slash.setLineWidth(4);
        slash.alpha = 0.8;
        this.slashes.push(slash);

        // Проверяем попадание по ягодам
        this.berries.forEach(berry => {
            const distance = Phaser.Math.Distance.Between(
                pointer.x, pointer.y,
                berry.x, berry.y
            );

            if (distance < 50) {
                // Увеличиваем счет
                this.score += 10;
                this.scoreText.setText(`Счет: ${this.score}`);
                
                // Уничтожаем ягоду
                berry.destroy();
                this.berries = this.berries.filter(b => b !== berry);
            }
        });
    }

    gameOver() {
        this.scene.pause();
        const gameOverText = this.add.text(400, 300, 'Игра окончена!', {
            fontSize: '64px',
            fill: '#fff'
        }).setOrigin(0.5);

        const restartButton = this.add.text(400, 400, 'Начать заново', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive();

        restartButton.on('pointerdown', () => {
            this.scene.restart();
        });
    }
} 