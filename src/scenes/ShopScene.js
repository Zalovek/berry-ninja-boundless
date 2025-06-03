import Phaser from 'phaser';
import { skins } from '../data/skins';
import { saveManager } from '../utils/saveManager';
import createStyledButton from '../utils/ButtonStyle';

export class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    preload() {
        // Ensure save data is loaded before create method uses it
        this.saveData = saveManager.load();
    }

    create() {
        const { width, height } = this.sys.game.config;

        // Add background image
        const bg = this.add.image(width / 2, height / 2, 'shopBackground');
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);
        bg.setDepth(-1);

        // Создаем кнопку "Назад" с обновленным дизайном
        const { container: backButtonContainer } = createStyledButton(
            this,
            60, 
            50, 
            '← Назад', 
            () => this.scene.start('MenuScene'),
            { 
                width: 120, 
                height: 40,
                fillColor: 0xFFFFFF,
                fillAlpha: 0.5, 
                cornerRadius: 20
            }
        );

        // Отображение скинов
        const itemWidth = width * 0.7;
        const itemHeight = 90;
        const itemCornerRadius = 15;
        let startY = height * 0.2;
        const spacingY = itemHeight + 20;
        const buttonItemWidth = 150;
        const buttonItemHeight = 45;

        Object.values(skins).forEach((skin, index) => {
            const currentY = startY + index * spacingY;
            const skinContainer = this.add.container(width / 2, currentY);
            
            // Фон для скина (card-like)
            const itemBackground = this.add.graphics();
            itemBackground.fillStyle(0x000000, 0.5); // Semi-transparent dark background for the card
            itemBackground.fillRoundedRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight, itemCornerRadius);
            skinContainer.add(itemBackground);

            // Название скина
            const nameText = this.add.text(-itemWidth / 2 + 20, -itemHeight / 2 + 25, skin.name, {
                fontSize: '22px',
                fill: '#FFFFFF',
                fontFamily: "'SF Pro Display', 'Roboto', 'Arial', sans-serif",
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            skinContainer.add(nameText);

            // Цена
            const priceTextY = -itemHeight/2 + 55;
            const priceText = this.add.text(-itemWidth / 2 + 20, priceTextY, `${skin.price} очков`, {
                fontSize: '18px',
                fill: '#CCCCCC', // Lighter grey for price
                fontFamily: "'SF Pro Display', 'Roboto', 'Arial', sans-serif"
            }).setOrigin(0, 0.5);
            skinContainer.add(priceText);

            // Кнопка покупки/выбора
            const isUnlocked = this.saveData.unlockedSkins.includes(skin.id);
            const isSelected = this.saveData.selectedSkin === skin.id;
            const canAfford = this.saveData.highScore >= skin.price;

            let buttonText = '';
            let buttonOptions = {};
            let clickHandler = () => {};

            const commonButtonOptions = {
                width: buttonItemWidth,
                height: buttonItemHeight,
                fontSize: '18px',
                cornerRadius: 20
            };

            if (isSelected) {
                buttonText = 'Выбрано';
                buttonOptions = { ...commonButtonOptions, fillColor: 0x28a745, fillAlpha: 0.9 }; // Green
                // No click handler needed or a simple one if you want to allow deselecting (not typical)
            } else if (isUnlocked) {
                buttonText = 'Выбрать';
                buttonOptions = { ...commonButtonOptions, fillColor: 0x007bff, fillAlpha: 0.8 }; // Blue
                clickHandler = () => {
                    saveManager.setSelectedSkin(skin.id);
                    this.scene.restart();
                };
            } else { // Locked
                buttonText = 'Купить';
                if (canAfford) {
                    buttonOptions = { ...commonButtonOptions, fillColor: 0x17a2b8, fillAlpha: 0.8 }; // Cyan/Teal
                    clickHandler = () => {
                        saveManager.unlockSkin(skin.id);
                        saveManager.setSelectedSkin(skin.id); // Auto-select after purchase
                        this.saveData = saveManager.load(); // Reload save data to reflect purchase
                        this.scene.restart();
                    };
                } else {
                    buttonOptions = { ...commonButtonOptions, fillColor: 0x6c757d, fillAlpha: 0.6, textColor: '#AAAAAA' }; // Greyed out
                    // Optional: Add a visual cue or small temporary text for 'not enough points'
                    clickHandler = () => {
                        // Simple feedback: maybe a small text appears briefly
                        const feedbackText = this.add.text(width / 2, height - 50, 'Недостаточно очков!', {
                            fontSize: '20px', fill: '#ff4444', backgroundColor: 'rgba(0,0,0,0.7)', padding: {x:10, y:5}
                        }).setOrigin(0.5);
                        this.time.delayedCall(2000, () => feedbackText.destroy());
                    };
                }
            }
            
            const { container: buttonContainer } = createStyledButton(
                this, 
                itemWidth / 2 - (buttonItemWidth / 2) - 20, // Position button to the right of the card
                0, // Centered vertically within the card
                buttonText, 
                clickHandler,
                buttonOptions
            );
            skinContainer.add(buttonContainer);
        });
    }
} 