import Phaser from 'phaser';
import { uiStyles } from '../utils/uiStyles';
import { saveManager } from '../utils/saveManager';

export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
        this.selectedColor = 0xFFFFFF; // Default white color
        this.colorButtons = [];
        this.colorZones = []; // Add array to store interactive zones
    }

    preload() {
        this.load.image('menu_background', 'assets/mainMenu.jpg');
    }

    create() {
        const { width, height } = this.cameras.main;

        // 1. Background
        this.add.image(width / 2, height / 2, 'menu_background')
            .setDisplaySize(width, height)
            .setDepth(-2);

        // Add darkening overlay for better readability
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.3)
            .setDepth(-1);

        // 2. Title
        this.add.text(width / 2, height * 0.1, 'SETTINGS', {
            fontFamily: '"Impact", fantasy',
            fontSize: '48px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        // 3. Subtitle for blade color selection
        this.add.text(width / 2, height * 0.25, 'Choose blade color', {
            fontFamily: '"Impact", fantasy',
            fontSize: '30px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // 4. Load saved color
        const saveData = saveManager.load();
        this.selectedColor = saveData.bladeColor || 0xFFFFFF;

        // 5. Create color palette
        this.createColorPalette(width, height);

        // 6. Create color preview
        this.createColorPreview(width, height);

        // 7. Create back button
        this.createBackButton(width, height);

        // Show current color info
        this.colorInfo = this.add.text(width / 2, height * 0.7, `Current color: 0x${this.selectedColor.toString(16).toUpperCase()}`, {
            fontFamily: '"Arial", sans-serif',
            fontSize: '18px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
    }

    createColorPalette(width, height) {
        // Available colors
        const colors = [
            0xFFFFFF, // White
            0xFF0000, // Red
            0x00FF00, // Green
            0x0000FF, // Blue
            0xFFFF00, // Yellow
            0xFF00FF, // Magenta
            0x00FFFF, // Cyan
            0xFF8000, // Orange
            0x8000FF  // Purple
        ];

        const paletteY = height * 0.4;
        const colorSize = 50;
        const spacing = 20;
        const totalWidth = colors.length * (colorSize + spacing) - spacing;
        let startX = (width - totalWidth) / 2;

        // Clear existing buttons and zones if any
        if (this.colorButtons && this.colorButtons.length > 0) {
            this.colorButtons.forEach(button => {
                if (button) button.destroy();
            });
        }
        this.colorButtons = [];
        
        // Clear existing interactive zones
        if (this.colorZones && this.colorZones.length > 0) {
            this.colorZones.forEach(zone => {
                if (zone) zone.destroy();
            });
        }
        this.colorZones = [];

        // Create color buttons
        colors.forEach((color, index) => {
            const x = startX + index * (colorSize + spacing) + colorSize / 2;
            
            // Create a simple interactive circle for each color
            const colorButton = this.add.graphics();
            
            // Draw the color circle
            colorButton.fillStyle(color, 1);
            colorButton.fillCircle(x, paletteY, colorSize / 2);
            colorButton.lineStyle(3, 0xFFFFFF, 1);
            colorButton.strokeCircle(x, paletteY, colorSize / 2);
            
            // Add selection indicator if this is the selected color
            // Ensure both are compared as numbers
            if (Number(color) === Number(this.selectedColor)) {
                colorButton.lineStyle(4, 0x000000, 1);
                colorButton.strokeCircle(x, paletteY, colorSize / 2 + 5);
            }
            
            // Make it interactive
            const hitArea = new Phaser.Geom.Circle(0, 0, colorSize / 2);
            
            // Create a rectangular zone instead of a circular one for better hit detection
            const zone = this.add.rectangle(x, paletteY, colorSize, colorSize)
                .setInteractive()
                .on('pointerdown', () => {
                    console.log("Color clicked:", color);
                    this.selectColor(color);
                });
                
            // Add visual feedback on hover
            zone.on('pointerover', () => {
                colorButton.lineStyle(4, 0xFFFFFF, 1);
                colorButton.strokeCircle(x, paletteY, colorSize / 2 + 3);
            });
            
            zone.on('pointerout', () => {
                colorButton.lineStyle(3, 0xFFFFFF, 1);
                colorButton.strokeCircle(x, paletteY, colorSize / 2);
                
                // Re-add selection indicator if this is the selected color
                if (Number(color) === Number(this.selectedColor)) {
                    colorButton.lineStyle(4, 0x000000, 1);
                    colorButton.strokeCircle(x, paletteY, colorSize / 2 + 5);
                }
            });
            
            this.colorButtons.push(colorButton);
            this.colorZones.push(zone); // Store the zone reference
        });
    }

    createColorPreview(width, height) {
        const previewY = height * 0.6;
        const previewWidth = width * 0.6;
        const previewHeight = 80;
        
        // Background for preview
        this.add.rectangle(width / 2, previewY, previewWidth, previewHeight, 0x000000, 0.5)
            .setStrokeStyle(2, 0xFFFFFF);
        
        // Preview title
        this.add.text(width / 2, previewY - previewHeight / 2 - 20, 'Preview', {
            fontFamily: '"Impact", fantasy',
            fontSize: '24px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Create graphics for the line
        this.previewGraphics = this.add.graphics();
        this.updatePreview();
    }

    selectColor(color) {
        // Save selected color
        this.selectedColor = color;
        
        // Make sure color is a number, not a string
        if (typeof color === 'string') {
            color = parseInt(color, 16);
        }
        
        // Use the dedicated method for setting blade color
        saveManager.setBladeColor(color);
        
        // Update UI without restarting scene
        this.updatePreview();
        this.colorInfo.setText(`Current color: 0x${this.selectedColor.toString(16).toUpperCase()}`);
        
        // Update color selection indicators
        this.createColorPalette(this.cameras.main.width, this.cameras.main.height);
        
        console.log("Color selected:", color, "typeof:", typeof color);
    }

    updatePreview() {
        const { width, height } = this.cameras.main;
        const previewY = height * 0.6;
        const previewWidth = width * 0.6;
        
        // Clear previous line
        this.previewGraphics.clear();
        
        // Draw line with selected color
        this.previewGraphics.lineStyle(6, this.selectedColor, 1);
        this.previewGraphics.beginPath();
        this.previewGraphics.moveTo(width / 2 - previewWidth / 2 + 20, previewY);
        this.previewGraphics.lineTo(width / 2 + previewWidth / 2 - 20, previewY);
        this.previewGraphics.strokePath();
    }

    createBackButton(width, height) {
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