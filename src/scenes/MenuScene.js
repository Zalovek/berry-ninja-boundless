// src/scenes/MenuScene.js
import Phaser from 'phaser';
import { uiStyles } from '../utils/uiStyles';
import { createInteractiveButton } from '../utils/createInteractiveButton';
import { saveManager } from '../utils/saveManager';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.music = null;
    }

    preload() {
        console.log('MenuScene preload started');
        // Загрузка фонов и специфичных для меню ассетов
        this.load.image('menu_background', 'assets/mainMenu.jpg');
    }

    create() {
        console.log('MenuScene create started');
        const { width, height } = this.cameras.main;

        // 1. Фон
        try {
            const bg = this.add.image(width / 2, height / 2, 'menu_background')
                .setDisplaySize(width, height)
                .setDepth(-2);
            console.log('Background image added successfully');
        } catch (error) {
            console.error('Error adding background image:', error);
        }

        // Добавляем затемнение для лучшей читаемости
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.3)
            .setDepth(-1);

        // 2. Музыка (если есть)
        // if (saveManager.isMusicEnabled()) {
        //     this.music = this.sound.add('menu_music', { loop: true, volume: 0.3 });
        //     if (!this.music.isPlaying) {
        //         this.music.play();
        //     }
        // }

        // 2. Заголовок игры
        this.add.text(width / 2, height * 0.15, 'Berry Ninja', {
            fontFamily: '"Impact", fantasy',
            fontSize: '60px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.15 + 70, 'Boundless Edition', {
            fontFamily: '"Impact", fantasy',
            fontSize: '30px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5);

        // 3. Кнопки меню с ягодами
        const buttonYStart = height * 0.45;
        const buttonSpacing = 80;
        const buttonWidth = width * 0.3; // Еще больше уменьшаем ширину кнопок
        const buttonHeight = 60;
        const berrySize = 40; // Уменьшаем размер ягод

        // Массив ягод для кнопок
        const berries = ['blueberry', 'strawberry', 'renderBerry', 'cranberry'];

        try {
            // Кнопка "PLAY"
            const playButton = this.createMemeBerryButton(
                width / 2,
                buttonYStart,
                'PLAY',
                berries[0],
                buttonWidth,
                buttonHeight,
                berrySize,
                () => {
                    console.log('Starting GameScene');
                    this.scene.start('GameScene');
                }
            );

            // Кнопка "SHOP"
            const shopButton = this.createMemeBerryButton(
                width / 2,
                buttonYStart + buttonSpacing,
                'SHOP',
                berries[1],
                buttonWidth,
                buttonHeight,
                berrySize,
                () => {
                    console.log('Starting ShopScene');
                    this.scene.start('ShopScene');
                }
            );

            // Кнопка "SETTINGS"
            const settingsButton = this.createMemeBerryButton(
                width / 2,
                buttonYStart + buttonSpacing * 2,
                'SETTINGS',
                berries[2],
                buttonWidth,
                buttonHeight,
                berrySize,
                () => {
                    console.log('Starting SettingsScene');
                    this.scene.start('SettingsScene');
                }
            );
        } catch (error) {
            console.error('Error creating menu buttons:', error);
        }

        // 4. Статистика
        const statsY = height * 0.88;
        const saveData = saveManager.load();
        const highScore = saveData.highScore || 0;

        // Лучший счет - меняем на "BEST score"
        this.add.text(width / 2, statsY, `BEST score: ${highScore}`, {
            fontFamily: '"Impact", fantasy',
            fontSize: '24px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // 5. Версия игры
        this.add.text(
            width / 2,
            height - 20,
            `v1.0.0 © Boundless Berries`,
            {
                fontFamily: '"Impact", fantasy',
                fontSize: '16px',
                fill: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2,
                align: 'center'
            }
        ).setOrigin(0.5);

        // Очистка при выключении сцены
        this.events.on('shutdown', () => {
            // if (this.music && this.music.isPlaying) {
            //     this.music.stop();
            // }
        });

        console.log('MenuScene create completed');
    }

    createMemeBerryButton(x, y, text, berryKey, width, height, berrySize, callback) {
        const buttonContainer = this.add.container(x, y);
        
        // Создаем белую кнопку с черной границей и большим закруглением
        const button = this.add.graphics();
        button.fillStyle(0xFFFFFF, 1);
        button.fillRoundedRect(-width / 2, -height / 2, width, height, 15);
        button.lineStyle(4, 0x000000, 1);
        button.strokeRoundedRect(-width / 2, -height / 2, width, height, 15);
        
        // Добавляем текст в стиле мемов (черный текст)
        const buttonText = this.add.text(0, 0, text, {
            fontFamily: '"Impact", fantasy',
            fontSize: '30px',
            fill: '#000000',
            align: 'center'
        }).setOrigin(0.5);
        
        // Добавляем ягоду так, чтобы она вписывалась в левый край кнопки
        let berry;
        try {
            berry = this.add.image(-width / 2 + berrySize / 2, 0, berryKey)
                .setDisplaySize(berrySize, berrySize);
        } catch (error) {
            console.error(`Error adding berry image ${berryKey}:`, error);
        }
        
        // Добавляем все элементы в контейнер
        buttonContainer.add([button, buttonText]);
        if (berry) buttonContainer.add(berry);
        
        // Делаем контейнер интерактивным
        buttonContainer.setSize(width, height);
        buttonContainer.setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => {
                // Эффект нажатия
                this.tweens.add({
                    targets: buttonContainer,
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 100,
                    yoyo: true,
                    onComplete: () => {
                        // Вызываем callback после анимации
                        if (callback) callback();
                    }
                });
            })
            .on('pointerover', () => {
                buttonText.setTint(0x555555);
            })
            .on('pointerout', () => {
                buttonText.clearTint();
            });
        
        return buttonContainer;
    }
}