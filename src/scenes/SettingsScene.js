import Phaser from 'phaser';
import { uiStyles } from '../utils/uiStyles';
import { saveManager } from '../utils/saveManager';

export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
        this.selectedColor = 0xFFFFFF; // Белый цвет по умолчанию
    }

    preload() {
        this.load.image('menu_background', 'assets/mainMenu.jpg');
    }

    create() {
        const { width, height } = this.cameras.main;

        // 1. Фон
        this.add.image(width / 2, height / 2, 'menu_background')
            .setDisplaySize(width, height)
            .setDepth(-2);

        // Добавляем затемнение для лучшей читаемости
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.3)
            .setDepth(-1);

        // 2. Заголовок
        this.add.text(width / 2, height * 0.1, 'SETTINGS', {
            fontFamily: '"Impact", fantasy',
            fontSize: '48px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        // 3. Подзаголовок для выбора цвета лезвия
        this.add.text(width / 2, height * 0.25, 'Choose blade color', {
            fontFamily: '"Impact", fantasy',
            fontSize: '30px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // 4. Загружаем сохраненный цвет
        const saveData = saveManager.load();
        this.selectedColor = saveData.bladeColor || 0xFFFFFF;

        // 5. Создаем палитру цветов
        this.createColorPalette(width, height);

        // 6. Предпросмотр выбранного цвета
        this.createColorPreview(width, height);

        // 7. Кнопка "Назад"
        this.createBackButton(width, height);

        // 8. Отладочная информация
        this.debugText = this.add.text(width / 2, height * 0.7, '', {
            fontFamily: '"Arial", sans-serif',
            fontSize: '16px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.updateDebugInfo();
    }

    createColorPalette(width, height) {
        // Массив доступных цветов
        const colors = [
            0xFFFFFF, // Белый
            0xFF0000, // Красный
            0x00FF00, // Зеленый
            0x0000FF, // Синий
            0xFFFF00, // Желтый
            0xFF00FF, // Пурпурный
            0x00FFFF, // Голубой
            0xFF8000, // Оранжевый
            0x8000FF  // Фиолетовый
        ];

        const paletteY = height * 0.4;
        const colorSize = 50;
        const spacing = 20;
        const totalWidth = colors.length * (colorSize + spacing) - spacing;
        let startX = (width - totalWidth) / 2;

        // Создаем цветные кнопки
        colors.forEach((color, index) => {
            const x = startX + index * (colorSize + spacing) + colorSize / 2;
            const colorButton = this.add.graphics();
            
            // Рисуем кружок с выбранным цветом
            colorButton.fillStyle(color, 1);
            colorButton.fillCircle(x, paletteY, colorSize / 2);
            colorButton.lineStyle(3, 0xFFFFFF, 1);
            colorButton.strokeCircle(x, paletteY, colorSize / 2);
            
            // Если это выбранный цвет, добавляем индикатор
            if (color === this.selectedColor) {
                colorButton.lineStyle(3, 0x000000, 1);
                colorButton.strokeCircle(x, paletteY, colorSize / 2 + 5);
            }
            
            // Делаем кнопку интерактивной
            const hitArea = new Phaser.Geom.Circle(x, paletteY, colorSize / 2);
            const hitAreaCallback = Phaser.Geom.Circle.Contains;
            
            this.add.zone(x, paletteY, colorSize, colorSize)
                .setInteractive({ hitArea, hitAreaCallback })
                .on('pointerdown', () => {
                    this.selectColor(color);
                });
        });
    }

    createColorPreview(width, height) {
        const previewY = height * 0.6;
        const previewWidth = width * 0.6;
        const previewHeight = 80;
        
        // Фон для предпросмотра
        this.add.rectangle(width / 2, previewY, previewWidth, previewHeight, 0x000000, 0.5)
            .setStrokeStyle(2, 0xFFFFFF);
        
        // Заголовок предпросмотра
        this.add.text(width / 2, previewY - previewHeight / 2 - 20, 'Preview', {
            fontFamily: '"Impact", fantasy',
            fontSize: '24px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Создаем графику для линии
        this.previewGraphics = this.add.graphics();
        this.updatePreview();
    }

    selectColor(color) {
        // Сохраняем выбранный цвет
        this.selectedColor = color;
        
        // Получаем текущее сохранение
        let saveData = saveManager.load();
        
        // Обновляем цвет лезвия
        saveData.bladeColor = color;
        
        // Сохраняем изменения
        saveManager.save(saveData);
        
        // Обновляем интерфейс и отладочную информацию
        this.updatePreview();
        this.updateDebugInfo();
        this.scene.restart();
    }

    updatePreview() {
        const { width, height } = this.cameras.main;
        const previewY = height * 0.6;
        const previewWidth = width * 0.6;
        
        // Очищаем предыдущую линию
        this.previewGraphics.clear();
        
        // Рисуем линию выбранного цвета
        this.previewGraphics.lineStyle(6, this.selectedColor, 1);
        this.previewGraphics.beginPath();
        this.previewGraphics.moveTo(width / 2 - previewWidth / 2 + 20, previewY);
        this.previewGraphics.lineTo(width / 2 + previewWidth / 2 - 20, previewY);
        this.previewGraphics.strokePath();
    }

    updateDebugInfo() {
        // Получаем данные из сохранения
        const saveData = saveManager.load();
        
        // Отображаем информацию о сохранении
        this.debugText.setText(`Current color: 0x${this.selectedColor.toString(16).toUpperCase()}`);
    }

    createBackButton(width, height) {
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