import Phaser from 'phaser';
import { skins } from '../data/skins';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
        this.lives = 3;
        this.selectedSkin = 'default';
        this.berries = [];
        this.slashes = [];
        this.trailPoints = [];
        this.splashes = [];
        this.shakeTime = 0;
    }

    preload() {
        // Загружаем фон
        this.load.image('background', 'assets/background.png');
        
        // Загружаем все скины
        Object.values(skins).forEach(skin => {
            skin.assets.forEach(asset => {
                this.load.image(asset, `assets/${asset}.png`);
            });
        });
        
        // Загружаем бомбу
        this.load.image('virus', 'assets/virus.gif');

        // Загружаем кляксы (допустим, их 4, если больше — увеличить цикл)
        for (let i = 1; i <= 4; i++) {
            this.load.image(`mark${i}`, `assets/marks/Mark (${i}).png`);
        }
    }

    create() {
        // Добавляем фон, растягивая на весь экран
        const bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.displayHeight = this.sys.game.config.height;

        // Группа для клякс
        this.splashGroup = this.add.group();

        // Создаем UI
        this.scoreText = this.add.text(16, 16, 'Счет: 0', {
            fontSize: '32px',
            fill: '#fff'
        });

        this.livesText = this.add.text(16, 56, 'Жизни: 3', {
            fontSize: '32px',
            fill: '#fff'
        });

        // Добавляем обработчик движения мыши
        this.input.on('pointermove', this.handlePointerMove, this);

        // Запускаем таймер появления ягод
        this.time.addEvent({
            delay: 1000,
            callback: this.spawnBerry,
            callbackScope: this,
            loop: true
        });
    }

    update() {
        // Обновляем позиции ягод
        this.berries.forEach(berry => {
            berry.x += berry.vx;
            berry.y += berry.vy;
            berry.vy += berry.gravity;
            berry.angle += berry.rotationSpeed * 60;
            // Эффект скорости (тень)
            if (!berry.shadow) {
                berry.shadow = this.add.ellipse(berry.x, berry.y + 20, 40, 18, 0x000000, 0.2);
                berry.shadow.setDepth(-1);
            }
            berry.shadow.x = berry.x;
            berry.shadow.y = berry.y + 20;
            
            // Если ягода упала за пределы экрана
            if (berry.y > this.sys.game.config.height + 60) {
                if (berry.shadow) berry.shadow.destroy();
                berry.destroy();
                this.berries = this.berries.filter(b => b !== berry);
                this.lives--;
                this.livesText.setText(`Жизни: ${this.lives}`);
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });

        // Обновляем след лезвия
        this.drawBladeTrail();

        // Обновляем кляксы
        this.splashes.forEach((splash, i) => {
            splash.alpha -= 0.007;
            splash.y += 1;
            if (splash.alpha <= 0) {
                splash.destroy();
                this.splashes.splice(i, 1);
            }
        });

        // Тряска экрана
        if (this.shakeTime > 0) {
            this.cameras.main.shake(50, 0.01);
            this.shakeTime--;
        }
    }

    spawnBerry() {
        const x = Phaser.Math.Between(100, this.sys.game.config.width - 100);
        // Собираем все assets из unlockedSkins
        const saveData = JSON.parse(localStorage.getItem('berry-ninja-save'));
        let berryAssets = [];
        if (saveData && saveData.unlockedSkins) {
            saveData.unlockedSkins.forEach(skinId => {
                if (skins[skinId]) {
                    berryAssets = berryAssets.concat(skins[skinId].assets);
                }
            });
        } else {
            berryAssets = skins['default'].assets;
        }
        const berryAsset = Phaser.Utils.Array.GetRandom(berryAssets);
        const berry = this.add.image(x, this.sys.game.config.height + 50, berryAsset);
        berry.setScale(0.5);
        // Физика подбрасывания
        berry.vx = Phaser.Math.FloatBetween(-2, 2);
        berry.vy = Phaser.Math.Between(-20, -14);
        berry.gravity = 0.7;
        berry.rotationSpeed = Phaser.Math.FloatBetween(-0.05, 0.05);
        this.berries.push(berry);
    }

    handlePointerMove(pointer) {
        this.trailPoints.push({ x: pointer.x, y: pointer.y });
        if (this.trailPoints.length > 30) {
            this.trailPoints.shift();
        }
        // Проверяем пересечение линии с ягодами
        if (this.trailPoints.length >= 2) {
            const p1 = this.trailPoints[this.trailPoints.length - 2];
            const p2 = this.trailPoints[this.trailPoints.length - 1];
            this.berries.forEach(berry => {
                if (berry._destroyed) return;
                const intersect = this.lineIntersectsCircle(p1, p2, { x: berry.x, y: berry.y, r: berry.displayWidth / 2 });
                if (intersect) {
                    // Разрезаем ягоду
                    this.sliceBerry(berry, p2);
                }
            });
        }
    }

    lineIntersectsCircle(p1, p2, circle) {
        // Алгоритм пересечения отрезка и круга
        const { x: cx, y: cy, r } = circle;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const fx = p1.x - cx;
        const fy = p1.y - cy;
        const a = dx * dx + dy * dy;
        const b = 2 * (fx * dx + fy * dy);
        const c = (fx * fx + fy * fy) - r * r;
        let discriminant = b * b - 4 * a * c;
        if (discriminant < 0) return false;
        discriminant = Math.sqrt(discriminant);
        const t1 = (-b - discriminant) / (2 * a);
        const t2 = (-b + discriminant) / (2 * a);
        if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)) return true;
        return false;
    }

    sliceBerry(berry, point) {
        if (berry._destroyed) return;
        berry._destroyed = true;
        this.score += 10;
        this.scoreText.setText(`Счет: ${this.score}`);
        // Клякса
        const markCount = 4;
        const markIndex = Phaser.Math.Between(1, markCount);
        const splash = this.add.image(point.x, point.y, `mark${markIndex}`);
        splash.setDepth(10);
        splash.alpha = 0.7;
        splash.setScale(Phaser.Math.FloatBetween(0.7, 1.1));
        let tint = 0xff0000;
        if (berry.texture.key.includes('blue')) tint = 0x2a4fff;
        if (berry.texture.key.includes('straw')) tint = 0xff5e00;
        if (berry.texture.key.includes('reka')) tint = 0x7b2ff2;
        if (berry.texture.key.includes('kashvi')) tint = 0x00ffb3;
        splash.setTint(tint);
        this.splashes.push(splash);
        // Вспышка на следе
        if (this.bladeGraphics) {
            this.bladeGraphics.save();
            this.bladeGraphics.lineStyle(24, 0xffffff, 0.3);
            this.bladeGraphics.strokeCircle(point.x, point.y, 24);
            this.bladeGraphics.restore();
        }
        // Эффект распада: две половинки
        const angle = Phaser.Math.FloatBetween(-Math.PI / 4, Math.PI / 4);
        const offset = 30;
        const half1 = this.add.image(berry.x - offset, berry.y, berry.texture.key).setScale(0.25, 0.5);
        const half2 = this.add.image(berry.x + offset, berry.y, berry.texture.key).setScale(0.25, 0.5);
        half1.angle = berry.angle - 15;
        half2.angle = berry.angle + 15;
        // Анимация разлёта
        this.tweens.add({
            targets: half1,
            x: half1.x - 60,
            y: half1.y + 60,
            angle: half1.angle - 30,
            alpha: 0,
            duration: 600,
            onComplete: () => half1.destroy()
        });
        this.tweens.add({
            targets: half2,
            x: half2.x + 60,
            y: half2.y + 60,
            angle: half2.angle + 30,
            alpha: 0,
            duration: 600,
            onComplete: () => half2.destroy()
        });
        // Сок (маленькие кляксы)
        for (let i = 0; i < 4; i++) {
            const drop = this.add.image(point.x, point.y, `mark${Phaser.Math.Between(1, markCount)}`);
            drop.setScale(Phaser.Math.FloatBetween(0.2, 0.4));
            drop.setTint(tint);
            drop.alpha = 0.8;
            this.tweens.add({
                targets: drop,
                x: point.x + Phaser.Math.Between(-40, 40),
                y: point.y + Phaser.Math.Between(20, 60),
                alpha: 0,
                duration: 500,
                onComplete: () => drop.destroy()
            });
        }
        // Удаляем ягоду
        if (berry.shadow) berry.shadow.destroy();
        berry.destroy();
        this.berries = this.berries.filter(b => b !== berry);
    }

    drawBladeTrail() {
        if (this.bladeGraphics) this.bladeGraphics.clear();
        else this.bladeGraphics = this.add.graphics();
        this.bladeGraphics.clear();
        if (this.trailPoints.length < 3) return;
        this.bladeGraphics.save();
        this.bladeGraphics.setDepth(20);
        const n = this.trailPoints.length - 1;
        // Catmull-Rom сглаживание (или простое сглаживание)
        for (let i = 1; i < this.trailPoints.length - 1; i++) {
            const t = i / n;
            const width = 4 + 16 * Math.sin(Math.PI * t);
            let color = Phaser.Display.Color.Interpolate.ColorWithColor(
                new Phaser.Display.Color(220, 220, 230),
                new Phaser.Display.Color(255, 255, 255),
                n,
                i
            );
            const hex = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
            this.bladeGraphics.lineStyle(width, hex, 1);
            this.bladeGraphics.beginPath();
            // Усредняем точки для плавности
            const p0 = this.trailPoints[i - 1];
            const p1 = this.trailPoints[i];
            const p2 = this.trailPoints[i + 1];
            const mx1 = (p0.x + p1.x) / 2;
            const my1 = (p0.y + p1.y) / 2;
            const mx2 = (p1.x + p2.x) / 2;
            const my2 = (p1.y + p2.y) / 2;
            this.bladeGraphics.moveTo(mx1, my1);
            this.bladeGraphics.lineTo(mx2, my2);
            this.bladeGraphics.strokePath();
            this.bladeGraphics.closePath();
        }
        this.bladeGraphics.restore();
    }

    gameOver() {
        this.scene.pause();
        const gameOverText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 - 50, 'Игра окончена!', {
            fontSize: '64px',
            fill: '#fff'
        }).setOrigin(0.5);

        const restartButton = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 30, 'Начать заново', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: 'rgba(0,0,0,0.1)'
        }).setOrigin(0.5).setInteractive();

        restartButton.on('pointerdown', () => {
            this.scene.resume();
            this.scene.restart();
        });

        const menuButton = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 90, 'В меню', {
            fontSize: '28px',
            fill: '#00ff99',
            backgroundColor: 'rgba(0,0,0,0.1)',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive();
        menuButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.start('MenuScene');
        });
    }
} 