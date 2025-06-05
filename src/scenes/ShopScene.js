import Phaser from 'phaser';
import { uiStyles } from '../utils/uiStyles';
import { createInteractiveButton } from '../utils/createInteractiveButton';
import { saveManager } from '../utils/saveManager';
import { skins } from '../data/skins';

export default class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
        this.selectedItem = null;
        this.coins = 0;
    }

    preload() {
        // Загрузка фона и скинов
        this.load.image('shop_background', 'assets/ShopBackground.jpg');
    }

    create() {
        const { width, height } = this.cameras.main;

        // 1. Фон
        this.add.image(width / 2, height / 2, 'shop_background')
            .setDisplaySize(width, height)
            .setDepth(-2);

        // Добавляем затемнение для лучшей читаемости
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.3)
            .setDepth(-1);

        // 2. Заголовок
        this.add.text(width / 2, height * 0.1, 'SHOP', {
            fontFamily: '"Impact", fantasy',
            fontSize: '48px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        // 3. Баланс монет
        const saveData = saveManager.load();
        this.coins = saveData.coins || 0;

        const coinText = this.add.text(
            width / 2,
            height * 0.2,
            `Points: ${this.coins}`,
            {
                fontFamily: '"Impact", fantasy',
                fontSize: '36px',
                fill: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 5,
                align: 'center'
            }
        ).setOrigin(0.5);

        // 4. Отображение покупных скинов
        this.displayShopItems();

        // 5. Кнопка "Назад"
        this.createBackButton();
    }

    displayShopItems() {
        const { width, height } = this.cameras.main;
        
        // Получаем доступные скины для покупки
        const shopSkins = ['kashvi', 'littleBrother', 'cranberry'];
        const prices = [500, 250, 100]; // Цены для каждого скина
        
        // Расположение скинов в ряд по центру экрана
        const itemWidth = width * 0.25;
        const spacing = width * 0.05;
        const totalWidth = (itemWidth * 3) + (spacing * 2);
        const startX = (width - totalWidth) / 2 + itemWidth / 2;
        const itemY = height * 0.5;
        
        // Создаем карточки для каждого скина
        shopSkins.forEach((skinKey, index) => {
            const x = startX + index * (itemWidth + spacing);
            this.createSkinCard(x, itemY, skinKey, prices[index]);
        });
    }
    
    createSkinCard(x, y, skinKey, price) {
        const cardWidth = 200;
        const cardHeight = 280;
        
        // Создаем карточку
        const card = this.add.graphics();
        card.fillStyle(0xFFFFFF, 1);
        card.fillRoundedRect(x - cardWidth/2, y - cardHeight/2, cardWidth, cardHeight, 10);
        card.lineStyle(4, 0x000000, 1);
        card.strokeRoundedRect(x - cardWidth/2, y - cardHeight/2, cardWidth, cardHeight, 10);
        
        // Добавляем изображение скина
        const skinImage = this.add.image(x, y - cardHeight/4, skinKey)
            .setDisplaySize(cardWidth * 0.8, cardWidth * 0.8);
        
        // Добавляем название скина
        const skinName = skinKey.charAt(0).toUpperCase() + skinKey.slice(1);
        this.add.text(x, y + cardHeight/4 - 40, skinName, {
            fontFamily: '"Impact", fantasy',
            fontSize: '24px',
            fill: '#000000',
            align: 'center'
        }).setOrigin(0.5);
        
        // Добавляем цену
        this.add.text(x, y + cardHeight/4 + 10, `${price} points`, {
            fontFamily: '"Impact", fantasy',
            fontSize: '20px',
            fill: '#000000',
            align: 'center'
        }).setOrigin(0.5);
        
        // Добавляем кнопку покупки
        const buttonWidth = cardWidth * 0.8;
        const buttonHeight = 40;
        const button = this.add.graphics();
        button.fillStyle(0x000000, 1);
        button.fillRoundedRect(x - buttonWidth/2, y + cardHeight/4 + 40 - buttonHeight/2, buttonWidth, buttonHeight, 8);
        
        const buttonText = this.add.text(x, y + cardHeight/4 + 40, 'BUY', {
            fontFamily: '"Impact", fantasy',
            fontSize: '20px',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Делаем кнопку интерактивной
        const hitArea = new Phaser.Geom.Rectangle(x - buttonWidth/2, y + cardHeight/4 + 40 - buttonHeight/2, buttonWidth, buttonHeight);
        const hitAreaCallback = Phaser.Geom.Rectangle.Contains;
        
        this.add.zone(x, y + cardHeight/4 + 40, buttonWidth, buttonHeight)
            .setOrigin(0.5)
            .setInteractive({ hitArea, hitAreaCallback })
            .on('pointerdown', () => {
                this.buySkin(skinKey, price);
            })
            .on('pointerover', () => {
                button.clear();
                button.fillStyle(0x333333, 1);
                button.fillRoundedRect(x - buttonWidth/2, y + cardHeight/4 + 40 - buttonHeight/2, buttonWidth, buttonHeight, 8);
            })
            .on('pointerout', () => {
                button.clear();
                button.fillStyle(0x000000, 1);
                button.fillRoundedRect(x - buttonWidth/2, y + cardHeight/4 + 40 - buttonHeight/2, buttonWidth, buttonHeight, 8);
            });
    }
    
    buySkin(skinKey, price) {
        const saveData = saveManager.load();
        
        // Проверяем, достаточно ли очков для покупки
        if (this.coins >= price) {
            // Вычитаем стоимость
            this.coins -= price;
            saveData.coins = this.coins;
            
            // Разблокируем скин
            if (!saveData.unlockedSkins) {
                saveData.unlockedSkins = [];
            }
            
            if (!saveData.unlockedSkins.includes(skinKey)) {
                saveData.unlockedSkins.push(skinKey);
            }
            
            // Сохраняем изменения
            saveManager.save(saveData);
            
            // Показываем сообщение об успешной покупке
            this.showMessage('Skin unlocked!', 0x00FF00);
            
            // Обновляем отображение очков
            this.scene.restart();
        } else {
            // Показываем сообщение о недостаточном количестве очков
            this.showMessage('Not enough points!', 0xFF0000);
        }
    }
    
    showMessage(text, color) {
        const { width, height } = this.cameras.main;
        
        // Создаем сообщение
        const message = this.add.text(width / 2, height / 2, text, {
            fontFamily: '"Impact", fantasy',
            fontSize: '36px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5)
        .setDepth(100);
        
        // Анимация появления и исчезновения
        this.tweens.add({
            targets: message,
            alpha: { from: 0, to: 1 },
            y: { from: height / 2 - 50, to: height / 2 },
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.tweens.add({
                    targets: message,
                    alpha: { from: 1, to: 0 },
                    y: { from: height / 2, to: height / 2 - 50 },
                    delay: 1000,
                    duration: 300,
                    ease: 'Power2',
                    onComplete: () => {
                        message.destroy();
                    }
                });
            }
        });
    }
    
    createBackButton() {
        const { width, height } = this.cameras.main;
        
        // Создаем кнопку "Назад"
        const buttonWidth = width * 0.3;
        const buttonHeight = 60;
        const buttonContainer = this.add.container(width / 2, height * 0.85);
        
        // Создаем белую кнопку с черной границей
        const button = this.add.graphics();
        button.fillStyle(0xFFFFFF, 1);
        button.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
        button.lineStyle(4, 0x000000, 1);
        button.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
        
        // Добавляем текст
        const buttonText = this.add.text(0, 0, 'BACK', {
            fontFamily: '"Impact", fantasy',
            fontSize: '30px',
            fill: '#000000',
            align: 'center'
        }).setOrigin(0.5);
        
        // Добавляем все элементы в контейнер
        buttonContainer.add([button, buttonText]);
        
        // Делаем контейнер интерактивным
        buttonContainer.setSize(buttonWidth, buttonHeight);
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
                        this.scene.start('MenuScene');
                    }
                });
            })
            .on('pointerover', () => {
                buttonText.setTint(0x555555);
            })
            .on('pointerout', () => {
                buttonText.clearTint();
            });
    }
} 