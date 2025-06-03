import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
        // Добавляем флаг для отслеживания состояния загрузки
        this.assetsLoaded = false;
        this.minLoadingTime = 5000; // Увеличиваем до 5 секунд, чтобы анимация проигралась полностью
        this.loadingStartTime = 0;
    }

    preload() {
        // Запоминаем время начала загрузки
        this.loadingStartTime = Date.now();
        
        // Не создаем никаких элементов интерфейса, только загружаем ассеты

        this.load.on('complete', () => {
            // Помечаем, что ассеты загружены
            this.assetsLoaded = true;
            
            // Проверяем, прошло ли минимальное время показа анимации
            this.checkLoadingComplete();
        });

        // Загружаем все необходимые ассеты
        this.load.image('mainMenuBackground', 'assets/mainMenu.jpg');
        this.load.image('shopBackground', 'assets/ShopBackground.jpg');
        this.load.image('blueberry', 'assets/blueberry.png');
        this.load.image('strawberry', 'assets/strawberry.png');
        this.load.image('cranberry', 'assets/cranberry.png');
        this.load.image('background', 'assets/background.png');
        // Добавляем предварительную загрузку других критических ассетов
    }

    create() {
        // Дополнительная проверка завершения загрузки, если вдруг её не проверили ранее
        if (this.assetsLoaded) {
            this.checkLoadingComplete();
        }
    }
    
    /**
     * Проверяет, прошло ли минимальное время показа анимации загрузки
     * Если время не прошло, то устанавливает таймер для перехода в меню
     */
    checkLoadingComplete() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.loadingStartTime;
        
        // Если минимальное время не истекло, устанавливаем таймер
        if (elapsedTime < this.minLoadingTime) {
            const remainingTime = this.minLoadingTime - elapsedTime;
            this.time.delayedCall(remainingTime, () => {
                this.finishLoading();
            });
        } else {
            // Если минимальное время уже прошло, сразу переходим в меню
            this.finishLoading();
        }
    }
    
    /**
     * Завершение загрузки и переход в меню
     */
    finishLoading() {
        // Переходим в меню
        this.scene.start('MenuScene');
    }
}
