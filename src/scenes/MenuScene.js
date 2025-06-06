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
        // Load backgrounds and menu-specific assets
        this.load.image('menu_background', 'assets/mainMenu.jpg');
    }

    create() {
        const { width, height } = this.cameras.main;

        // 1. Background
        const bg = this.add.image(width / 2, height / 2, 'menu_background')
            .setDisplaySize(width, height)
            .setDepth(-2);

        // Add darkening overlay for better readability
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.3)
            .setDepth(-1);

        // 2. Game title
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

        // 3. Menu buttons with berries
        const buttonYStart = height * 0.45;
        const buttonSpacing = 80;
        const buttonWidth = width * 0.3;
        const buttonHeight = 60;
        const berrySize = 40;

        // Array of berries for buttons
        const berries = ['blueberry', 'strawberry', 'renderBerry', 'cranberry'];

        // "PLAY" button
        const playButton = this.createMemeBerryButton(
            width / 2,
            buttonYStart,
            'PLAY',
            berries[0],
            buttonWidth,
            buttonHeight,
            berrySize,
            () => {
                // Make sure we're starting with a fresh game scene
                if (this.scene.get('GameScene').scene.isActive()) {
                    this.scene.stop('GameScene');
                }
                this.scene.start('GameScene');
            }
        );

        // "SHOP" button
        const shopButton = this.createMemeBerryButton(
            width / 2,
            buttonYStart + buttonSpacing,
            'SHOP',
            berries[1],
            buttonWidth,
            buttonHeight,
            berrySize,
            () => {
                this.scene.start('ShopScene');
            }
        );

        // "SETTINGS" button
        const settingsButton = this.createMemeBerryButton(
            width / 2,
            buttonYStart + buttonSpacing * 2,
            'SETTINGS',
            berries[2],
            buttonWidth,
            buttonHeight,
            berrySize,
            () => {
                this.scene.start('SettingsScene');
            }
        );

        // 4. Statistics
        const statsY = height * 0.88;
        const saveData = saveManager.load();
        const highScore = saveData.highScore || 0;

        // Best score
        this.add.text(width / 2, statsY, `BEST score: ${highScore}`, {
            fontFamily: '"Impact", fantasy',
            fontSize: '24px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // 5. Game version
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
    }

    createMemeBerryButton(x, y, text, berryKey, width, height, berrySize, callback) {
        const buttonContainer = this.add.container(x, y);
        
        // Create white button with black border and large rounding
        const button = this.add.graphics();
        button.fillStyle(0xFFFFFF, 1);
        button.fillRoundedRect(-width / 2, -height / 2, width, height, 15);
        button.lineStyle(4, 0x000000, 1);
        button.strokeRoundedRect(-width / 2, -height / 2, width, height, 15);
        
        // Add text in meme style (black text)
        const buttonText = this.add.text(0, 0, text, {
            fontFamily: '"Impact", fantasy',
            fontSize: '30px',
            fill: '#000000',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add berry so it fits into the left edge of the button
        const berry = this.add.image(-width / 2 + berrySize / 2, 0, berryKey)
            .setDisplaySize(berrySize, berrySize);
        
        // Add all elements to the container
        buttonContainer.add([button, buttonText]);
        if (berry) buttonContainer.add(berry);
        
        // Make the container interactive
        buttonContainer.setSize(width, height);
        buttonContainer.setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => {
                // Pressing effect
                this.tweens.add({
                    targets: buttonContainer,
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 100,
                    yoyo: true,
                    onComplete: () => {
                        // Call callback after animation
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