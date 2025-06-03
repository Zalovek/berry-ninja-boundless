import Phaser from 'phaser';
import createStyledButton from '../utils/ButtonStyle';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Предзагрузим ягоды для кнопок
        this.load.image('blueberry', 'assets/blueberry.png');
        this.load.image('strawberry', 'assets/strawberry.png');
    }
    
    create() {
        const { width, height } = this.sys.game.config;
        const fontFamily = `'Open Sans', 'Roboto', 'Arial', sans-serif`; // Обновили шрифт

        // Add background image
        const bg = this.add.image(width / 2, height / 2, 'mainMenuBackground');
        // Scale background to cover the entire screen
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);
        bg.setDepth(-1); // Ensure background is behind other elements

        // Создаем кнопку "Играть" с ягодой слева - выше центра экрана
        const buttonY1 = height * 0.35; // Позиция выше центра экрана, как на фото
        
        // Создаем контейнер для кнопки и ягоды, чтобы они двигались вместе
        const playContainer = this.add.container(width / 2, buttonY1);
        
        // Добавляем ягоду голубику к кнопке Play
        const blueberry = this.add.image(-150, -15, 'blueberry').setScale(0.65);
        playContainer.add(blueberry);
        
        // Создаем кнопку Play
        const { container: playButtonContainer } = createStyledButton(
            this,
            0, // Относительно контейнера
            0, 
            'PLAY',
            () => {
                this.scene.start('GameScene');
            }
        );
        
        // Добавляем кнопку в контейнер
        playContainer.add(playButtonContainer);
        
        // Создаем кнопку "Магазин" с ягодой слева
        const buttonY2 = height * 0.45; // Чуть ниже первой кнопки
        
        // Создаем контейнер для кнопки и ягоды
        const shopContainer = this.add.container(width / 2, buttonY2);
        
        // Добавляем красную ягоду к кнопке Shop
        const redberry = this.add.image(-150, -15, 'strawberry').setScale(0.8);
        shopContainer.add(redberry);
        
        // Создаем кнопку Shop
        const { container: shopButtonContainer } = createStyledButton(
            this,
            0, // Относительно контейнера
            0,
            'SHOP',
            () => {
                this.scene.start('ShopScene');
            }
        );
        
        // Добавляем кнопку в контейнер
        shopContainer.add(shopButtonContainer);

        // Hide the initial HTML loading overlay if it's still visible
        // This is a fallback, as main.js should handle it primarily
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}