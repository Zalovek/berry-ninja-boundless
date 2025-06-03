import Phaser from 'phaser';

export default function createStyledButton(scene, x, y, text, onClick, options = {}) {
    const defaultOptions = {
        width: 300, 
        height: 60, 
        cornerRadius: 36, // Точное значение из требований
        fillColor: 0xFFFFFF, // Белый фон
        fillAlpha: 0.5,      // Полупрозрачный (50%)
        hoverFillAlpha: 0.7, // Просто подсветка при наведении
        pressedFillAlpha: 0.6, // Та же прозрачность при нажатии
        strokeColor: 0xFFFFFF, 
        strokeAlpha: 0.1,
        strokeWidth: 0, // Без обводки, как на изображении
        textColor: '#565656', // Серый текст, как на изображении
        fontSize: '24px', 
        fontFamily: "'Open Sans', 'Roboto', 'Arial', sans-serif", // Шрифт как на изображении
        fontStyle: 'italic bold' // Курсив и жирный, как на изображении
    };

    const mergedOptions = { ...defaultOptions, ...options };

    const {
        width,
        height,
        cornerRadius,
        fillColor,
        fillAlpha,
        hoverFillAlpha,
        pressedFillAlpha,
        strokeColor,
        strokeAlpha,
        strokeWidth,
        textColor,
        fontSize,
        fontFamily,
        fontStyle
    } = mergedOptions;

    const container = scene.add.container(x, y);

    // Фон кнопки
    const buttonBackground = scene.add.graphics();
    buttonBackground.fillStyle(fillColor, fillAlpha);
    buttonBackground.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
    if (strokeWidth > 0) {
        buttonBackground.lineStyle(strokeWidth, strokeColor, strokeAlpha);
        buttonBackground.strokeRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
    }
    container.add(buttonBackground);

    // Текст кнопки
    const buttonText = scene.add.text(0, 0, text, {
        fontFamily: fontFamily,
        fontSize: fontSize,
        fill: textColor,
        fontStyle: fontStyle,
        align: 'center'
    }).setOrigin(0.5);
    container.add(buttonText);

    // Интерактивность
    // Устанавливаем интерактивную область для всего контейнера
    container.setSize(width, height);
    container.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);

    // Hover effect - просто подсветка при наведении
    container.on('pointerover', () => {
        buttonBackground.clear();
        buttonBackground.fillStyle(fillColor, hoverFillAlpha);
        if (strokeWidth > 0) buttonBackground.lineStyle(strokeWidth, strokeColor, strokeAlpha);
        buttonBackground.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
        if (strokeWidth > 0) buttonBackground.strokeRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
        scene.game.canvas.style.cursor = 'pointer';
    });

    // Normal state
    container.on('pointerout', () => {
        buttonBackground.clear();
        buttonBackground.fillStyle(fillColor, fillAlpha);
        if (strokeWidth > 0) buttonBackground.lineStyle(strokeWidth, strokeColor, strokeAlpha);
        buttonBackground.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
        if (strokeWidth > 0) buttonBackground.strokeRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
        scene.game.canvas.style.cursor = 'default';
        // Не сбрасываем масштаб здесь, чтобы не мешать эффекту нажатия
    });

    // Press effect - небольшое смещение вниз при нажатии
    container.on('pointerdown', () => {
        buttonBackground.clear();
        buttonBackground.fillStyle(fillColor, pressedFillAlpha);
        if (strokeWidth > 0) buttonBackground.lineStyle(strokeWidth, strokeColor, strokeAlpha);
        buttonBackground.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
        if (strokeWidth > 0) buttonBackground.strokeRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
        // Вместо изменения Y-координаты используем масштабирование
        container.setScale(0.97);
    });

    // Track if the pointer was over the button when pressed
    let isOver = false;
    container.on('pointerover', () => { isOver = true; });
    container.on('pointerout', () => { isOver = false; });

    // Release effect
    const onPointerUp = () => {
        if (!container.active) return; // Prevent errors if container was destroyed

        if (isOver) {
            // Restore hover state if still hovering
            buttonBackground.clear();
            buttonBackground.fillStyle(fillColor, hoverFillAlpha);
            if (strokeWidth > 0) buttonBackground.lineStyle(strokeWidth, strokeColor, strokeAlpha);
            buttonBackground.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
            if (strokeWidth > 0) buttonBackground.strokeRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
            container.setScale(1); // Возвращаем нормальный масштаб
            
            // Вызываем обработчик клика
            if (onClick) {
                onClick();
            }
        } else {
            // Restore normal state
            buttonBackground.clear();
            buttonBackground.fillStyle(fillColor, fillAlpha);
            if (strokeWidth > 0) buttonBackground.lineStyle(strokeWidth, strokeColor, strokeAlpha);
            buttonBackground.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
            if (strokeWidth > 0) buttonBackground.strokeRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
            container.setScale(1); // Возвращаем нормальный масштаб
        }
    };

    container.on('pointerup', onPointerUp);
    // Handle case where pointer is released outside the button after being pressed down inside it
    scene.input.on('pointerup', onPointerUp, scene);


    return { container, buttonBackground, buttonText }; // Возвращаем элементы для возможной модификации
}