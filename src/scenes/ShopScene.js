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
        // Load background and skins
        this.load.image('shop_background', 'assets/ShopBackground.jpg');
    }

    create() {
        const { width, height } = this.cameras.main;

        // 1. Background
        this.add.image(width / 2, height / 2, 'shop_background')
            .setDisplaySize(width, height)
            .setDepth(-2);

        // Add darkening overlay for better readability
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.3)
            .setDepth(-1);

        // 2. Title
        this.add.text(width / 2, height * 0.1, 'SHOP', {
            fontFamily: '"Impact", fantasy',
            fontSize: '48px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        // 3. Points balance
        const saveData = saveManager.load();
        this.coins = saveData.coins || 0;

        this.coinText = this.add.text(
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

        // 4. Display shop items
        this.displayShopItems();

        // 5. Back button
        this.createBackButton();
    }

    displayShopItems() {
        const { width, height } = this.cameras.main;
        
        // Get available skins for purchase
        const shopSkins = ['reka', 'kashvi', 'littleBrother'];
        const prices = [10000, 10000, 10000]; // Prices for each skin
        
        // Layout skins in a row in center of screen
        const itemWidth = width * 0.25;
        const spacing = width * 0.05;
        const totalWidth = (itemWidth * 3) + (spacing * 2);
        const startX = (width - totalWidth) / 2 + itemWidth / 2;
        const itemY = height * 0.5;
        
        // Create cards for each skin
        shopSkins.forEach((skinKey, index) => {
            const x = startX + index * (itemWidth + spacing);
            this.createSkinCard(x, itemY, skinKey, prices[index]);
        });
    }
    
    createSkinCard(x, y, skinKey, price) {
        const cardWidth = 200;
        const cardHeight = 280;
        
        // Create card
        const card = this.add.graphics();
        card.fillStyle(0xFFFFFF, 1);
        card.fillRoundedRect(x - cardWidth/2, y - cardHeight/2, cardWidth, cardHeight, 10);
        card.lineStyle(4, 0x000000, 1);
        card.strokeRoundedRect(x - cardWidth/2, y - cardHeight/2, cardWidth, cardHeight, 10);
        
        // Add skin image
        const skinImage = this.add.image(x, y - cardHeight/4, skinKey)
            .setDisplaySize(cardWidth * 0.8, cardWidth * 0.8);
        
        // Add skin name
        const skinName = skinKey.charAt(0).toUpperCase() + skinKey.slice(1);
        this.add.text(x, y + cardHeight/4 - 40, skinName, {
            fontFamily: '"Impact", fantasy',
            fontSize: '24px',
            fill: '#000000',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add price
        this.add.text(x, y + cardHeight/4 + 10, `${price} points`, {
            fontFamily: '"Impact", fantasy',
            fontSize: '20px',
            fill: '#000000',
            align: 'center'
        }).setOrigin(0.5);
        
        // Create button container for better interactivity
        const buttonWidth = cardWidth * 0.8;
        const buttonHeight = 40;
        const buttonContainer = this.add.container(x, y + cardHeight/4 + 40);
        
        // Add button graphics
        const buttonGraphic = this.add.graphics();
        buttonGraphic.fillStyle(0x000000, 1);
        buttonGraphic.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
        
        // Add button text
        const buttonText = this.add.text(0, 0, 'BUY', {
            fontFamily: '"Impact", fantasy',
            fontSize: '20px',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add elements to container
        buttonContainer.add([buttonGraphic, buttonText]);
        
        // Make container interactive
        buttonContainer.setSize(buttonWidth, buttonHeight);
        buttonContainer.setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => {
                // Purchase effect
                this.tweens.add({
                    targets: buttonContainer,
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 100,
                    yoyo: true,
                    onComplete: () => {
                        this.buySkin(skinKey, price);
                    }
                });
            })
            .on('pointerover', () => {
                buttonText.setTint(0x555555);
                buttonGraphic.clear();
                buttonGraphic.fillStyle(0x333333, 1);
                buttonGraphic.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
            })
            .on('pointerout', () => {
                buttonText.clearTint();
                buttonGraphic.clear();
                buttonGraphic.fillStyle(0x000000, 1);
                buttonGraphic.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
            });
            
        // Check if skin is already unlocked
        const saveData = saveManager.load();
        if (saveData.unlockedSkins && saveData.unlockedSkins.includes(skinKey)) {
            // Disable button if already purchased
            buttonGraphic.clear();
            buttonGraphic.fillStyle(0x888888, 1);
            buttonGraphic.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
            buttonText.setText('OWNED');
            buttonContainer.disableInteractive();
        }
    }
    
    buySkin(skinKey, price) {
        let saveData = saveManager.load();
        
        // Check if we already own this skin
        if (saveData.unlockedSkins && saveData.unlockedSkins.includes(skinKey)) {
            this.showMessage('Already owned!', 0xFFFF00);
            return;
        }
        
        // Check if we have enough points
        if (this.coins >= price) {
            // Deduct cost
            this.coins -= price;
            saveData.coins = this.coins;
            
            // Unlock skin
            if (!saveData.unlockedSkins) {
                saveData.unlockedSkins = [];
            }
            
            saveData.unlockedSkins.push(skinKey);
            
            // Save changes
            saveManager.save(saveData);
            
            // Update display
            this.coinText.setText(`Points: ${this.coins}`);
            
            // Show success message
            this.showMessage('Skin unlocked!', 0x00FF00);
            
            // Restart scene to update UI
            this.time.delayedCall(1500, () => {
                this.scene.restart();
            });
        } else {
            // Show message about insufficient points
            this.showMessage('Not enough points!', 0xFF0000);
        }
    }
    
    showMessage(text, color) {
        const { width, height } = this.cameras.main;
        
        // Create message with background
        const messageContainer = this.add.container(width / 2, height / 2);
        messageContainer.setDepth(100);
        
        // Background for message
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.8);
        bg.fillRoundedRect(-200, -50, 400, 100, 16);
        bg.lineStyle(4, color, 1);
        bg.strokeRoundedRect(-200, -50, 400, 100, 16);
        
        // Message text
        const message = this.add.text(0, 0, text, {
            fontFamily: '"Impact", fantasy',
            fontSize: '36px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5);
        
        // Add to container
        messageContainer.add([bg, message]);
        
        // Animation
        messageContainer.setAlpha(0);
        messageContainer.y = height / 2 - 50;
        
        this.tweens.add({
            targets: messageContainer,
            alpha: 1,
            y: height / 2,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.tweens.add({
                    targets: messageContainer,
                    alpha: 0,
                    y: height / 2 - 50,
                    delay: 1200,
                    duration: 300,
                    ease: 'Power2',
                    onComplete: () => {
                        messageContainer.destroy();
                    }
                });
            }
        });
    }
    
    createBackButton() {
        const { width, height } = this.cameras.main;
        
        // Create "Back" button
        const buttonWidth = width * 0.3;
        const buttonHeight = 60;
        const buttonContainer = this.add.container(width / 2, height * 0.85);
        
        // Create white button with black border
        const button = this.add.graphics();
        button.fillStyle(0xFFFFFF, 1);
        button.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
        button.lineStyle(4, 0x000000, 1);
        button.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
        
        // Add text
        const buttonText = this.add.text(0, 0, 'BACK', {
            fontFamily: '"Impact", fantasy',
            fontSize: '30px',
            fill: '#000000',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add all elements to container
        buttonContainer.add([button, buttonText]);
        
        // Make container interactive
        buttonContainer.setSize(buttonWidth, buttonHeight);
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