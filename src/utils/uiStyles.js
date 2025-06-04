// iOS/MIUI стили с адаптацией под игровой контекст Boundless
export const uiStyles = {
    // Цвета
    colors: {
        // Основные цвета
        primary: 0x007AFF,       // iOS синий
        primaryDark: 0x0056b3,   // Для нажатий
        primaryLight: 0x58aFFF,  // Для наведений
        
        // Акцентные цвета
        accent: 0x34C759,        // iOS зеленый
        accentOrange: 0xFF9500,  // iOS оранжевый
        destructive: 0xFF3B30,   // iOS красный
        
        // Фоны
        backgroundMain: 0x0D0D0F, // Очень темный фон для игрового пространства
        surfacePrimary: 0x1C1C1E, // Основной фон для UI элементов
        surfaceSecondary: 0x2C2C2E, // Вторичный фон
        
        // Текст
        textPrimaryOnDark: '#FFFFFF',
        textSecondaryOnDark: '#AEAEB2',
        textPrimaryOnLight: '#000000',
        textPlaceholder: '#8E8D92',
        
        // Элементы UI
        divider: 0x3A3A3C,
        iconDefault: '#AEAEB2',
        
        // Игровые акценты
        gameAccentBlue: 0x00A9FF,
        gameAccentPurple: 0xBF5AF2,
        
        // Устаревшие цвета (оставлены для обратной совместимости)
        secondary: 0x5856D6,
        success: 0x34C759,
        danger: 0xFF3B30,
        warning: 0xFF9500,
        info: 0x5AC8FA,
        background: {
            light: 0xF2F2F7,
            dark: 0x1C1C1E,
            card: 0xFFFFFF,
            cardDark: 0x2C2C2E
        },
        text: {
            primary: 0x000000,
            secondary: 0x8E8E93,
            light: 0xFFFFFF
        }
    },

    // Шрифты
    fontFamily: {
        main: "'SF Pro Display', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
        display: "'SF Pro Display', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
        text: "'SF Pro Text', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
    },

    // Размеры шрифтов
    fontSize: {
        caption: '12px',
        footnote: '13px',
        subhead: '15px',
        callout: '16px',
        body: '17px',
        headline: '17px',
        title3: '20px',
        title2: '22px',
        title1: '28px',
        largeTitle: '34px'
    },

    // Насыщенность шрифтов
    fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
    },

    // Стили кнопок
    button: {
        // Базовые параметры для всех кнопок
        base: {
            height: 48,
            cornerRadius: 24,
            paddingX: 20,
            fontFamily: "'SF Pro Text', 'Roboto', sans-serif",
            fontSize: '17px',
            fontStyle: '600',
            letterSpacing: '0.5px',
            transitionDuration: 100
        },
        
        // Типы кнопок
        primary: {
            backgroundColor: 0x007AFF,
            textColor: '#FFFFFF',
            hoverBackgroundColor: 0x0056b3,
            pressedBackgroundColor: 0x004080
        },
        
        secondary: {
            backgroundColor: 0xE5E5EA,
            textColor: '#000000',
            hoverBackgroundColor: 0xDCDCE0,
            pressedBackgroundColor: 0xD1D1D6
        },
        
        destructive: {
            backgroundColor: 0xFF3B30,
            textColor: '#FFFFFF',
            hoverBackgroundColor: 0xD93229,
            pressedBackgroundColor: 0xB32A23
        },
        
        tinted: {
            backgroundColor: 0x007AFF,
            textColor: '#007AFF',
            backgroundAlpha: 0.15,
            hoverBackgroundAlpha: 0.25,
            pressedBackgroundAlpha: 0.35
        },
        
        borderless: {
            backgroundColor: 0x000000,
            backgroundAlpha: 0,
            textColor: '#007AFF',
            hoverTextColor: '#0056b3',
            pressedTextColor: '#004080',
            hoverBackgroundColor: 0x8E8D92,
            hoverBackgroundAlpha: 0.1,
            pressedBackgroundColor: 0x8E8D92,
            pressedBackgroundAlpha: 0.2,
            fontStyle: '400'
        }
    },

    // Стили карточек
    card: {
        backgroundColor: 0x1C1C1E,
        cornerRadius: 14,
        padding: 16,
        shadowOffsetX: 0,
        shadowOffsetY: 2,
        shadowBlur: 8,
        shadowColor: 'rgba(0,0,0,0.3)'
    },

    // Стили текста
    textStyles: {
        largeTitle: {
            fontFamily: "'SF Pro Display', 'Roboto', sans-serif",
            fontSize: '34px',
            fontStyle: '700',
            fill: '#FFFFFF'
        },
        title1: {
            fontFamily: "'SF Pro Display', 'Roboto', sans-serif",
            fontSize: '28px',
            fontStyle: '700',
            fill: '#FFFFFF'
        },
        headline: {
            fontFamily: "'SF Pro Text', 'Roboto', sans-serif",
            fontSize: '17px',
            fontStyle: '600',
            fill: '#FFFFFF'
        },
        body: {
            fontFamily: "'SF Pro Text', 'Roboto', sans-serif",
            fontSize: '17px',
            fontStyle: '400',
            fill: '#AEAEB2'
        },
        caption: {
            fontFamily: "'SF Pro Text', 'Roboto', sans-serif",
            fontSize: '12px',
            fontStyle: '400',
            fill: '#8E8D92'
        },
        buttonLabel: {
            fontFamily: "'SF Pro Text', 'Roboto', sans-serif",
            fontSize: '17px',
            fontStyle: '600'
        }
    },

    // Глобальные настройки
    global: {
        baseScreenWidth: 375,  // iPhone 8 как базовая ширина
        baseScreenHeight: 667,
        animationDuration: {
            fast: 150,
            normal: 250,
            slow: 350
        },
        spacing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 24,
            xl: 32
        }
    }
}; 