import Phaser from 'phaser';
import { uiStyles } from '../utils/uiStyles';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
        this.assetsLoaded = false;
        this.minLoadingTime = 1000; // Минимальное время показа загрузчика
        this.loadStartTime = 0;
    }

    preload() {
        const { width, height } = this.cameras.main;
        this.loadStartTime = Date.now();

        // Устанавливаем цвет фона загрузочной сцены
        this.cameras.main.setBackgroundColor(uiStyles.colors.backgroundMain);

        // Создаем стильный прогресс-бар
        const progressBarWidth = width * 0.6;
        const progressBarHeight = 4;
        const progressBarX = (width - progressBarWidth) / 2;
        const progressBarY = height * 0.5;

        const progressBar = this.add.graphics();
        progressBar.fillStyle(uiStyles.colors.primary, 0.2);
        progressBar.fillRect(
            progressBarX,
            progressBarY - progressBarHeight/2,
            progressBarWidth,
            progressBarHeight
        );

        // Текст статуса загрузки
        const loadingText = this.add.text(
            width / 2,
            progressBarY - 30,
            'Загрузка...',
            {
                ...uiStyles.textStyles.headline,
                fill: uiStyles.colors.textPrimaryOnDark
            }
        ).setOrigin(0.5);

        // Текст процента загрузки
        const percentText = this.add.text(
            width / 2,
            progressBarY + 30,
            '0%',
            {
                ...uiStyles.textStyles.caption,
                fill: uiStyles.colors.textSecondaryOnDark
            }
        ).setOrigin(0.5);

        // Обновление прогресс-бара
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(uiStyles.colors.primary, 0.2);
            progressBar.fillRect(
                progressBarX,
                progressBarY - progressBarHeight/2,
                progressBarWidth,
                progressBarHeight
            );
            progressBar.fillStyle(uiStyles.colors.primary, 1);
            progressBar.fillRect(
                progressBarX,
                progressBarY - progressBarHeight/2,
                progressBarWidth * value,
                progressBarHeight
            );
            percentText.setText(Math.floor(value * 100) + '%');
        });

        this.load.on('complete', () => {
            this.assetsLoaded = true;
            this.checkLoadingComplete();
        });

        // Загружаем все необходимые ассеты
        this.load.image('menu_background', 'assets/mainMenu.jpg');
        this.load.image('shop_background', 'assets/ShopBackground.jpg');
        this.load.image('game_background', 'assets/background.png');
        
        // Загружаем ягоды и другие игровые ассеты
        const berryAssets = ['cranberry', 'blueberry', 'renderBerry', 'strawberry', 'kashvi', 'littleBrother', 'reka'];
        berryAssets.forEach(asset => {
            this.load.image(asset, `assets/${asset}.png`);
        });
        
        // Загружаем бомбу и эффекты взрыва
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('explosion', 'assets/explosion.png');
        
        // Загружаем эффекты клякс
        for (let i = 1; i <= 4; i++) {
            this.load.image(`mark${i}`, `assets/marks/Mark (${i}).png`);
        }
    }

    checkLoadingComplete() {
        const elapsedTime = Date.now() - this.loadStartTime;
        const remainingTime = Math.max(0, this.minLoadingTime - elapsedTime);

        if (remainingTime > 0) {
            this.time.delayedCall(remainingTime, this.finishLoading, [], this);
        } else {
            this.finishLoading();
        }
    }

    finishLoading() {
        // Плавное затухание элементов загрузки
        const elements = this.children.list.filter(child => 
            child instanceof Phaser.GameObjects.Text || 
            child instanceof Phaser.GameObjects.Graphics
        );

        this.tweens.add({
            targets: elements,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // Уведомляем игру о завершении загрузки
                this.game.events.emit('bootcomplete');
                
                // Make sure MenuScene is not running already
                if (this.scene.isActive('MenuScene')) {
                    this.scene.stop('MenuScene');
                }
                
                // Start MenuScene after a small delay
                this.time.delayedCall(100, () => {
                    this.scene.start('MenuScene');
                }, [], this);
            }
        });
    }
}
