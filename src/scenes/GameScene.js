import Phaser from 'phaser';
import { skins } from '../data/skins';
import { uiStyles } from '../utils/uiStyles';
import { createInteractiveButton } from '../utils/createInteractiveButton';
import { saveManager } from '../utils/saveManager';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
        this.lives = 3;
        this.berries = [];
        this.slashes = [];
        this.trailPoints = [];
        this.splashes = [];
        this.gameOver = false;
        this.bladeColor = 0xFFFFFF; // Цвет лезвия по умолчанию
        this.bladeTrail = null;
        this.bladeGraphics = null;
    }

    preload() {
        // Загружаем фон
        this.load.image('background', 'assets/background.png');
        
        // Загружаем все скины ягод
        Object.values(skins).forEach(skin => {
            skin.assets.forEach(asset => {
                this.load.image(asset, `assets/${asset}.png`);
            });
        });
        
        // Загружаем бомбу и эффект взрыва
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('explosion', 'assets/explosion.png');

        // Загружаем кляксы
        for (let i = 1; i <= 4; i++) {
            this.load.image(`mark${i}`, `assets/marks/Mark (${i}).png`);
        }
    }

    create() {
        const { width, height } = this.cameras.main;

        // 1. Фон
        this.add.image(width / 2, height / 2, 'background')
            .setDisplaySize(width, height)
            .setDepth(-2);

        // 2. Создаем графику для лезвия
        this.bladeGraphics = this.add.graphics();
        
        // Загружаем цвет лезвия из настроек
        const saveData = saveManager.load();
        this.bladeColor = saveData.bladeColor || 0xFFFFFF;
        
        // 3. Инициализируем массив для точек следа
        this.trailPoints = [];
        
        // 4. Создаем группы для игровых объектов
        this.berriesGroup = this.add.group();
        this.bombsGroup = this.add.group();
        this.splashGroup = this.add.group();
        
        // 5. Отображение счета и жизней
        this.createScoreAndLives();
        
        // 6. Обработчики событий
        this.input.on('pointermove', this.handlePointerMove, this);
        this.input.on('pointerdown', this.handlePointerDown, this);
        this.input.on('pointerup', this.handlePointerUp, this);
        
        // 7. Таймеры для спавна ягод и бомб
        this.berryTimer = this.time.addEvent({
            delay: 1000,
            callback: this.spawnBerry,
            callbackScope: this,
            loop: true
        });
        
        this.bombTimer = this.time.addEvent({
            delay: 3000,
            callback: this.spawnBomb,
            callbackScope: this,
            loop: true
        });
        
        // 8. Кнопка возврата в меню
        this.createBackButton();
    }
    
    createScoreAndLives() {
        const { width } = this.cameras.main;
        
        // Счет
        this.scoreText = this.add.text(20, 20, 'Счет: 0', {
            fontFamily: '"Impact", fantasy',
            fontSize: '32px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 6
        });
        
        // Жизни
        this.livesText = this.add.text(width - 20, 20, 'Жизни: 3', {
            fontFamily: '"Impact", fantasy',
            fontSize: '32px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(1, 0);
    }
    
    createBackButton() {
        const { width, height } = this.cameras.main;
        
        const backButton = this.add.text(width - 20, height - 20, 'МЕНЮ', {
            fontFamily: '"Impact", fantasy',
            fontSize: '24px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(1, 1)
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
    
    handlePointerMove(pointer) {
        // Добавляем новую точку в начало массива
        this.trailPoints.unshift({ x: pointer.x, y: pointer.y, time: this.time.now });
        
        // Ограничиваем количество точек для оптимизации
        if (this.trailPoints.length > 20) {
            this.trailPoints.pop();
        }
        
        // Проверяем столкновения с ягодами и бомбами
        this.checkCollisions(pointer);
    }
    
    handlePointerDown(pointer) {
        // Начинаем отслеживать движение лезвия
        this.isSlicing = true;
    }
    
    handlePointerUp() {
        // Прекращаем отслеживать движение лезвия
        this.isSlicing = false;
        
        // Очищаем точки следа
        this.trailPoints = [];
    }
    
    checkCollisions(pointer) {
        if (!this.isSlicing || this.trailPoints.length < 2) return;
        
        // Получаем последние две точки для проверки пересечения
        const p1 = this.trailPoints[0];
        const p2 = this.trailPoints[1];
        
        // Проверяем столкновения с ягодами
        this.berriesGroup.getChildren().forEach(berry => {
            if (!berry.sliced && this.lineIntersectsCircle(p1, p2, berry)) {
                this.sliceBerry(berry);
            }
        });
        
        // Проверяем столкновения с бомбами
        this.bombsGroup.getChildren().forEach(bomb => {
            if (!bomb.exploded && this.lineIntersectsCircle(p1, p2, bomb)) {
                this.explodeBomb(bomb);
            }
        });
    }
    
    lineIntersectsCircle(p1, p2, circle) {
        // Расстояние от точки до линии
        const x1 = p1.x;
        const y1 = p1.y;
        const x2 = p2.x;
        const y2 = p2.y;
        const cx = circle.x;
        const cy = circle.y;
        const r = circle.displayWidth / 2;
        
        // Вектор линии
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        // Параметризованная позиция круга относительно линии
        const t = ((cx - x1) * dx + (cy - y1) * dy) / (dx * dx + dy * dy);
        
        // Находим ближайшую точку на линии к центру круга
        let closestX, closestY;
        if (t < 0) {
            closestX = x1;
            closestY = y1;
        } else if (t > 1) {
            closestX = x2;
            closestY = y2;
        } else {
            closestX = x1 + t * dx;
            closestY = y1 + t * dy;
        }
        
        // Расстояние от ближайшей точки до центра круга
        const distance = Math.sqrt((closestX - cx) ** 2 + (closestY - cy) ** 2);
        
        return distance <= r;
    }
    
    spawnBerry() {
        if (this.gameOver) return;
        
        const { width, height } = this.cameras.main;
        
        // Выбираем случайную ягоду из доступных
        const berryTypes = skins.default.assets;
        const berryType = berryTypes[Phaser.Math.Between(0, berryTypes.length - 1)];
        
        // Создаем ягоду
        const x = Phaser.Math.Between(100, width - 100);
        const berry = this.add.image(x, height + 50, berryType);
        
        // Устанавливаем размер в зависимости от типа
        const scale = Phaser.Math.FloatBetween(0.6, 1.0);
        berry.setScale(scale);
        
        // Добавляем физику
        this.physics.add.existing(berry);
        berry.body.setVelocity(
            Phaser.Math.Between(-200, 200),
            Phaser.Math.Between(-800, -600)
        );
        berry.body.setGravityY(300);
        
        // Добавляем свойства для отслеживания состояния
        berry.sliced = false;
        
        // Добавляем в группу
        this.berriesGroup.add(berry);
    }
    
    spawnBomb() {
        if (this.gameOver) return;
        
        const { width, height } = this.cameras.main;
        
        // Создаем бомбу
        const x = Phaser.Math.Between(100, width - 100);
        const bomb = this.add.image(x, height + 50, 'bomb');
        
        // Устанавливаем размер
        bomb.setScale(0.7);
        
        // Добавляем физику
        this.physics.add.existing(bomb);
        bomb.body.setVelocity(
            Phaser.Math.Between(-150, 150),
            Phaser.Math.Between(-700, -500)
        );
        bomb.body.setGravityY(300);
        
        // Добавляем свойства для отслеживания состояния
        bomb.exploded = false;
        
        // Добавляем в группу
        this.bombsGroup.add(bomb);
    }
    
    sliceBerry(berry) {
        // Помечаем ягоду как разрезанную
        berry.sliced = true;
        
        // Создаем две половинки ягоды с разным направлением движения
        const leftHalf = this.add.image(berry.x, berry.y, berry.texture.key).setScale(berry.scaleX, berry.scaleY);
        const rightHalf = this.add.image(berry.x, berry.y, berry.texture.key).setScale(berry.scaleX, berry.scaleY);
        
        // Добавляем физику к половинкам
        this.physics.add.existing(leftHalf);
        this.physics.add.existing(rightHalf);
        
        // Устанавливаем скорости половинок
        leftHalf.body.setVelocity(berry.body.velocity.x - 100, berry.body.velocity.y);
        rightHalf.body.setVelocity(berry.body.velocity.x + 100, berry.body.velocity.y);
        leftHalf.body.setGravityY(300);
        rightHalf.body.setGravityY(300);
        
        // Добавляем вращение
        leftHalf.body.setAngularVelocity(-300);
        rightHalf.body.setAngularVelocity(300);
        
        // Создаем эффект кляксы в месте разреза
        const splashIndex = Phaser.Math.Between(1, 4);
        const splash = this.add.image(berry.x, berry.y, `mark${splashIndex}`);
        splash.setScale(0.5);
        splash.setAlpha(0.8);
        
        // Подбираем цвет кляксы в зависимости от типа ягоды
        let tint;
        switch(berry.texture.key) {
            case 'blueberry': tint = 0x3498db; break;
            case 'strawberry': tint = 0xe74c3c; break;
            case 'cranberry': tint = 0xc0392b; break;
            case 'renderBerry': tint = 0x9b59b6; break;
            default: tint = 0xffffff;
        }
        splash.setTint(tint);
        
        // Добавляем анимацию исчезновения кляксы
        this.tweens.add({
            targets: splash,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                splash.destroy();
            }
        });
        
        // Добавляем очки
        this.score += 10;
        this.scoreText.setText(`Счет: ${this.score}`);
        
        // Уничтожаем оригинальную ягоду
        berry.destroy();
        
        // Удаляем половинки через некоторое время
        this.time.delayedCall(2000, () => {
            leftHalf.destroy();
            rightHalf.destroy();
        });
    }
    
    explodeBomb(bomb) {
        // Помечаем бомбу как взорванную
        bomb.exploded = true;
        
        // Создаем эффект взрыва
        const explosion = this.add.image(bomb.x, bomb.y, 'explosion').setScale(0);
        
        // Анимация взрыва
        this.tweens.add({
            targets: explosion,
            scale: 2,
            alpha: { from: 1, to: 0 },
            duration: 500,
            onComplete: () => {
                explosion.destroy();
            }
        });
        
        // Уменьшаем количество жизней
        this.lives--;
        this.livesText.setText(`Жизни: ${this.lives}`);
        
        // Проверяем условие окончания игры
        if (this.lives <= 0) {
            this.endGame();
        }
        
        // Уничтожаем бомбу
        bomb.destroy();
        
        // Эффект тряски камеры
        this.cameras.main.shake(300, 0.02);
    }
    
    update() {
        // Обновляем след лезвия
        this.drawBladeTrail();
        
        // Удаляем объекты, вышедшие за пределы экрана
        this.cleanupObjects();
    }
    
    drawBladeTrail() {
        // Очищаем предыдущий след
        this.bladeGraphics.clear();
        
        // Если нет точек или не режем, не рисуем след
        if (this.trailPoints.length < 2 || !this.isSlicing) return;
        
        // Рисуем след лезвия с выбранным цветом
        this.bladeGraphics.lineStyle(6, this.bladeColor, 1);
        
        // Начинаем путь с первой точки
        this.bladeGraphics.beginPath();
        this.bladeGraphics.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);
        
        // Соединяем точки
        for (let i = 1; i < this.trailPoints.length; i++) {
            this.bladeGraphics.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
        }
        
        // Завершаем путь
        this.bladeGraphics.strokePath();
    }
    
    cleanupObjects() {
        const { height } = this.cameras.main;
        
        // Удаляем ягоды, вышедшие за нижнюю границу экрана
        this.berriesGroup.getChildren().forEach(berry => {
            if (berry.y > height + 100) {
                berry.destroy();
            }
        });
        
        // Удаляем бомбы, вышедшие за нижнюю границу экрана
        this.bombsGroup.getChildren().forEach(bomb => {
            if (bomb.y > height + 100) {
                bomb.destroy();
            }
        });
    }
    
    endGame() {
        // Устанавливаем флаг окончания игры
        this.gameOver = true;
        
        // Останавливаем таймеры
        this.berryTimer.remove();
        this.bombTimer.remove();
        
        // Сохраняем лучший результат
        const saveData = saveManager.load();
        if (this.score > (saveData.highScore || 0)) {
            saveData.highScore = this.score;
            saveManager.save(saveData);
        }
        
        // Отображаем экран окончания игры
        const { width, height } = this.cameras.main;
        
        // Затемнение
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        
        // Текст "Game Over"
        this.add.text(width / 2, height / 3, 'GAME OVER', {
            fontFamily: '"Impact", fantasy',
            fontSize: '64px',
            fill: '#FFFFFF',
            stroke: '#FF0000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Итоговый счет
        this.add.text(width / 2, height / 2, `Счет: ${this.score}`, {
            fontFamily: '"Impact", fantasy',
            fontSize: '48px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);
        
        // Кнопка "Играть снова"
        const restartButton = this.add.text(width / 2, height * 2/3, 'ИГРАТЬ СНОВА', {
            fontFamily: '"Impact", fantasy',
            fontSize: '36px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.restart();
        });
        
        // Кнопка "Меню"
        const menuButton = this.add.text(width / 2, height * 2/3 + 60, 'МЕНЮ', {
            fontFamily: '"Impact", fantasy',
            fontSize: '36px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
} 