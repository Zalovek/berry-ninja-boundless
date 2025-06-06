import Phaser from 'phaser';
import { uiStyles } from './uiStyles';

/**
 * Создает стилизованную интерактивную кнопку в стиле iOS/MIUI.
 * @param {Phaser.Scene} scene - Сцена, на которой создается кнопка
 * @param {number} x - Координата X центра кнопки
 * @param {number} y - Координата Y центра кнопки
 * @param {string} text - Текст кнопки
 * @param {function} onClick - Функция обратного вызова при клике
 * @param {object} [styleOptions={}] - Объект для переопределения стилей из uiStyles.button
 * @param {number} [fixedWidth=null] - Фиксированная ширина кнопки. Если null, ширина будет по тексту
 * @returns {Phaser.GameObjects.Container} Контейнер с кнопкой
 */
export function createInteractiveButton(scene, x, y, text, onClick, styleOptions = uiStyles.button.primary, fixedWidth = null) {
    // Объединяем базовые стили с переданными опциями
    const baseStyle = uiStyles.button.base;
    const currentStyle = { ...baseStyle, ...styleOptions };

    // Убеждаемся, что все необходимые цвета определены
    const defaultColors = {
        backgroundColor: uiStyles.colors.primary,
        hoverBackgroundColor: uiStyles.colors.primaryDark,
        pressedBackgroundColor: uiStyles.colors.primaryLight,
        textColor: '#FFFFFF',
        cornerRadius: 24 // Увеличиваем скругление по умолчанию
    };

    // Применяем дефолтные цвета, если они не определены
    const finalStyle = {
        ...currentStyle,
        backgroundColor: currentStyle.backgroundColor || defaultColors.backgroundColor,
        hoverBackgroundColor: currentStyle.hoverBackgroundColor || defaultColors.hoverBackgroundColor,
        pressedBackgroundColor: currentStyle.pressedBackgroundColor || defaultColors.pressedBackgroundColor,
        textColor: currentStyle.textColor || defaultColors.textColor,
        cornerRadius: currentStyle.cornerRadius || defaultColors.cornerRadius
    };

    // Рассчитываем ширину кнопки
    const textPadding = finalStyle.paddingX || 20;
    const tempText = scene.add.text(0, 0, text, {
        fontFamily: finalStyle.fontFamily,
        fontSize: finalStyle.fontSize,
        fontStyle: finalStyle.fontStyle,
        letterSpacing: finalStyle.letterSpacing
    }).setVisible(false);
    
    const buttonWidth = fixedWidth !== null ? fixedWidth : tempText.width + textPadding * 2;
    const buttonHeight = finalStyle.height;
    tempText.destroy();

    // Создаем контейнер
    const container = scene.add.container(x, y);
    container.setSize(buttonWidth, buttonHeight);

    // Фон кнопки
    const buttonBackground = scene.add.graphics();
    container.add(buttonBackground);

    // Функция для отрисовки фона
    const drawBackground = (bgColor, bgAlpha = 1) => {
        buttonBackground.clear();
        buttonBackground.fillStyle(bgColor, bgAlpha);
        buttonBackground.fillRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            finalStyle.cornerRadius
        );

        // Обводка, если задана
        if (finalStyle.strokeWidth && finalStyle.strokeWidth > 0) {
            buttonBackground.lineStyle(
                finalStyle.strokeWidth,
                finalStyle.strokeColor || finalStyle.backgroundColor,
                finalStyle.strokeAlpha || 1
            );
            buttonBackground.strokeRoundedRect(
                -buttonWidth / 2,
                -buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                finalStyle.cornerRadius
            );
        }
    };

    // Начальное состояние
    drawBackground(finalStyle.backgroundColor, finalStyle.backgroundAlpha || 1);

    // Текст кнопки
    const buttonText = scene.add.text(0, 0, text, {
        fontFamily: finalStyle.fontFamily,
        fontSize: finalStyle.fontSize,
        fill: finalStyle.textColor,
        fontStyle: finalStyle.fontStyle,
        letterSpacing: finalStyle.letterSpacing,
        align: 'center'
    }).setOrigin(0.5);
    container.add(buttonText);

    // Делаем кнопку интерактивной
    container.setInteractive(
        new Phaser.Geom.Rectangle(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight
        ),
        Phaser.Geom.Rectangle.Contains
    );

    let isPointerDown = false;
    let currentColor = Phaser.Display.Color.ValueToColor(finalStyle.backgroundColor);

    // Обработчики событий
    container.on('pointerover', () => {
        if (!container.input.enabled) return;
        scene.game.canvas.style.cursor = 'pointer';
        
        if (!isPointerDown) {
            scene.tweens.killTweensOf(buttonBackground);
            const targetColor = Phaser.Display.Color.ValueToColor(finalStyle.hoverBackgroundColor);
            
            scene.tweens.add({
                targets: { value: 0 },
                value: 1,
                duration: finalStyle.transitionDuration,
                ease: 'Power1',
                onUpdate: (tween) => {
                    const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                        currentColor,
                        targetColor,
                        100,
                        Math.floor(tween.progress * 100)
                    );
                    drawBackground(
                        Phaser.Display.Color.GetColor(color.r, color.g, color.b),
                        finalStyle.hoverBackgroundAlpha || finalStyle.backgroundAlpha || 1
                    );
                }
            });
        }
    });

    container.on('pointerout', () => {
        if (!container.input.enabled) return;
        scene.game.canvas.style.cursor = 'default';
        
        if (!isPointerDown) {
            scene.tweens.killTweensOf(buttonBackground);
            const targetColor = Phaser.Display.Color.ValueToColor(finalStyle.backgroundColor);
            
            scene.tweens.add({
                targets: { value: 0 },
                value: 1,
                duration: finalStyle.transitionDuration,
                ease: 'Power1',
                onUpdate: (tween) => {
                    const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                        currentColor,
                        targetColor,
                        100,
                        Math.floor(tween.progress * 100)
                    );
                    drawBackground(
                        Phaser.Display.Color.GetColor(color.r, color.g, color.b),
                        finalStyle.backgroundAlpha || 1
                    );
                }
            });
        }
    });

    container.on('pointerdown', () => {
        if (!container.input.enabled) return;
        isPointerDown = true;
        
        scene.tweens.killTweensOf(buttonBackground);
        currentColor = Phaser.Display.Color.ValueToColor(finalStyle.pressedBackgroundColor);
        drawBackground(
            finalStyle.pressedBackgroundColor,
            finalStyle.pressedBackgroundAlpha || finalStyle.backgroundAlpha || 1
        );
        
        scene.tweens.killTweensOf(container);
        scene.tweens.add({
            targets: container,
            scaleX: 0.97,
            scaleY: 0.97,
            duration: finalStyle.transitionDuration / 2,
            ease: 'Quad.easeOut'
        });
    });

    container.on('pointerup', (pointer) => {
        if (!container.input.enabled) return;
        
        const wasPressed = isPointerDown;
        isPointerDown = false;

        // Проверяем, находится ли указатель над кнопкой
        const localPoint = container.getLocalPoint(pointer.worldX, pointer.worldY);
        const isOver = container.input.hitArea.contains(localPoint.x, localPoint.y);

        scene.tweens.killTweensOf(container);
        scene.tweens.add({
            targets: container,
            scaleX: 1,
            scaleY: 1,
            duration: finalStyle.transitionDuration / 2,
            ease: 'Quad.easeIn'
        });

        if (wasPressed && isOver) {
            scene.tweens.killTweensOf(buttonBackground);
            currentColor = Phaser.Display.Color.ValueToColor(finalStyle.hoverBackgroundColor);
            drawBackground(
                finalStyle.hoverBackgroundColor,
                finalStyle.hoverBackgroundAlpha || finalStyle.backgroundAlpha || 1
            );
            if (onClick) {
                onClick();
            }
        } else {
            scene.tweens.killTweensOf(buttonBackground);
            currentColor = Phaser.Display.Color.ValueToColor(finalStyle.backgroundColor);
            drawBackground(
                finalStyle.backgroundColor,
                finalStyle.backgroundAlpha || 1
            );
        }
    });

    // Методы для управления кнопкой
    container.setText = (newText) => {
        buttonText.setText(newText);
        if (fixedWidth === null) {
            const newTempText = scene.add.text(0, 0, newText, {
                fontFamily: finalStyle.fontFamily,
                fontSize: finalStyle.fontSize,
                fontStyle: finalStyle.fontStyle
            }).setVisible(false);
            
            const newButtonWidth = newTempText.width + textPadding * 2;
            newTempText.destroy();
            
            container.setSize(newButtonWidth, buttonHeight);
            buttonBackground.clear();
            drawBackground(finalStyle.backgroundColor, finalStyle.backgroundAlpha);
            container.input.hitArea.setSize(newButtonWidth, buttonHeight);
            container.input.hitArea.x = -newButtonWidth / 2;
        }
    };

    container.setButtonEnabled = (isEnabled) => {
        container.input.enabled = isEnabled;
        if (isEnabled) {
            container.setAlpha(1);
            scene.game.canvas.style.cursor = 'default';
            currentColor = Phaser.Display.Color.ValueToColor(finalStyle.backgroundColor);
            drawBackground(finalStyle.backgroundColor, finalStyle.backgroundAlpha);
        } else {
            container.setAlpha(0.6);
            scene.game.canvas.style.cursor = 'default';
            currentColor = Phaser.Display.Color.ValueToColor(uiStyles.colors.secondary);
            drawBackground(uiStyles.colors.secondary, 0.5);
        }
    };

    return container;
} 