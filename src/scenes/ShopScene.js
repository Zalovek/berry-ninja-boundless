import Phaser from 'phaser';
import { skins } from '../data/skins';
import { saveManager } from '../utils/saveManager';

export class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
        this.saveData = saveManager.load();
    }

    create() {
        // Заголовок
        this.add.text(400, 50, 'Магазин скинов', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);

        // Кнопка возврата
        const backButton = this.add.text(50, 50, '← Назад', {
            fontSize: '24px',
            fill: '#fff'
        }).setInteractive();

        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        // Отображение скинов
        let y = 150;
        Object.values(skins).forEach((skin, index) => {
            const skinContainer = this.add.container(400, y);
            
            // Фон для скина
            const background = this.add.rectangle(0, 0, 300, 80, 0x333333);
            skinContainer.add(background);

            // Название скина
            const nameText = this.add.text(-140, -15, skin.name, {
                fontSize: '20px',
                fill: '#fff'
            });
            skinContainer.add(nameText);

            // Цена
            const priceText = this.add.text(-140, 15, `${skin.price} очков`, {
                fontSize: '16px',
                fill: this.saveData.unlockedSkins.includes(skin.id) ? '#00ff00' : '#ff0000'
            });
            skinContainer.add(priceText);

            // Кнопка покупки/выбора
            const isUnlocked = this.saveData.unlockedSkins.includes(skin.id);
            const isSelected = this.saveData.selectedSkin === skin.id;
            const buttonText = isSelected ? 'Выбрано' : (isUnlocked ? 'Выбрать' : 'Купить');
            
            const button = this.add.text(100, 0, buttonText, {
                fontSize: '20px',
                fill: '#fff',
                backgroundColor: isSelected ? '#00ff00' : (isUnlocked ? '#0000ff' : '#ff0000'),
                padding: { x: 10, y: 5 }
            }).setInteractive();

            button.on('pointerdown', () => {
                if (isUnlocked) {
                    saveManager.setSelectedSkin(skin.id);
                    this.scene.restart();
                } else {
                    // Покупка скина
                    if (this.saveData.highScore >= skin.price) {
                        saveManager.unlockSkin(skin.id);
                        saveManager.setSelectedSkin(skin.id);
                        this.scene.restart();
                    } else {
                        // Недостаточно очков
                        button.setText('Недостаточно очков');
                        button.setBackgroundColor('#ff0000');
                    }
                }
            });

            skinContainer.add(button);
            y += 100;
        });
    }
} 