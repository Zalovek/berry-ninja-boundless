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
        this.bladeColor = 0xFFFFFF; // Default blade color
        this.bladeTrail = null;
        this.bladeGraphics = null;
        this.isSlicing = true; // Blade is active from the start
        this.lastMoveTime = 0; // Last movement time
        this.comboCount = 0; // Combo counter
        this.comboTimer = null; // Combo timer
        this.comboText = null; // Combo text
        this.waveIndex = 0; // Current wave index
        this.isWaveActive = false; // Active wave flag
    }

    preload() {
        // Load background
        this.load.image('background', 'assets/background.png');
        
        // Load all berry skins
        Object.values(skins).forEach(skin => {
            skin.assets.forEach(asset => {
                this.load.image(asset, `assets/${asset}.png`);
            });
        });
        
        // Load bomb and explosion effect
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('explosion', 'assets/explosion.png');

        // Load splatter marks
        for (let i = 1; i <= 4; i++) {
            this.load.image(`mark${i}`, `assets/marks/Mark (${i}).png`);
        }
    }

    create() {
        const { width, height } = this.cameras.main;

        // 1. Background
        this.add.image(width / 2, height / 2, 'background')
            .setDisplaySize(width, height)
            .setDepth(-2);

        // 2. Create blade graphics
        this.bladeGraphics = this.add.graphics();
        
        // Load blade color from settings
        const saveData = saveManager.load();
        this.bladeColor = saveData.bladeColor || 0xFFFFFF;
        
        // 3. Initialize trail points array
        this.trailPoints = [];
        this.lastMoveTime = this.time.now;
        
        // 4. Create groups for game objects
        this.berriesGroup = this.add.group();
        this.bombsGroup = this.add.group();
        this.splashGroup = this.add.group();
        
        // 5. Display score and lives
        this.createScoreAndLives();
        
        // 6. Event handlers
        this.input.on('pointermove', this.handlePointerMove, this);
        
        // 7. Start wave system
        this.startWaveSystem();
        
        // 8. Create bomb timer
        this.bombTimer = this.time.addEvent({
            delay: 3000,
            callback: this.spawnBomb,
            callbackScope: this,
            loop: true
        });
        
        // 9. Back button
        this.createBackButton();
        
        // 10. Create combo text
        this.comboText = this.add.text(width / 2, height / 2, '', {
            fontFamily: '"Impact", fantasy',
            fontSize: '48px',
            fill: '#FFFF00',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setAlpha(0).setDepth(100);
    }
    
    startWaveSystem() {
        // Define wave parameters
        this.waves = [
            { count: 5, interval: 500, delay: 2000 },
            { count: 8, interval: 400, delay: 3000 },
            { count: 10, interval: 300, delay: 4000 }
        ];
        
        // Start first wave
        this.startWave();
    }
    
    startWave() {
        if (this.gameOver) return;
        
        // Get current wave
        const currentWave = this.waves[this.waveIndex % this.waves.length];
        this.isWaveActive = true;
        
        // Create berries for the wave
        let berriesSpawned = 0;
        
        const spawnInterval = this.time.addEvent({
            delay: currentWave.interval,
            callback: () => {
                if (this.gameOver) {
                    spawnInterval.remove();
                    return;
                }
                
                this.spawnBerry();
                berriesSpawned++;
                
                if (berriesSpawned >= currentWave.count) {
                    this.isWaveActive = false;
                    spawnInterval.remove();
                    
                    // Move to next wave after delay
                    this.time.delayedCall(currentWave.delay, () => {
                        this.waveIndex++;
                        this.startWave();
                    });
                }
            },
            callbackScope: this,
            loop: true
        });
    }
    
    createScoreAndLives() {
        const { width } = this.cameras.main;
        
        // Score
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontFamily: '"Impact", fantasy',
            fontSize: '32px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 6
        });
        
        // Lives
        this.livesText = this.add.text(width - 20, 20, 'Lives: 3', {
            fontFamily: '"Impact", fantasy',
            fontSize: '32px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(1, 0);
    }
    
    createBackButton() {
        const { width, height } = this.cameras.main;
        
        const backButton = this.add.text(width - 20, height - 20, 'MENU', {
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
        // Update last movement time
        this.lastMoveTime = this.time.now;
        
        // Add new point to the beginning of the array
        this.trailPoints.unshift({ x: pointer.x, y: pointer.y, time: this.time.now });
        
        // Limit the number of points for optimization
        if (this.trailPoints.length > 20) {
            this.trailPoints.pop();
        }
        
        // Check collisions with berries and bombs
        this.checkCollisions(pointer);
    }
    
    checkCollisions(pointer) {
        if (!this.isSlicing || this.trailPoints.length < 2) return;
        
        // Get the last two points for intersection check
        const p1 = this.trailPoints[0];
        const p2 = this.trailPoints[1];
        
        let berriesSliced = 0;
        
        // Check collisions with berries
        this.berriesGroup.getChildren().forEach(berry => {
            if (!berry.sliced && this.lineIntersectsCircle(p1, p2, berry)) {
                this.sliceBerry(berry);
                berriesSliced++;
            }
        });
        
        // Update combo if berries were sliced
        if (berriesSliced > 0) {
            this.updateCombo(berriesSliced);
        }
        
        // Check collisions with bombs
        this.bombsGroup.getChildren().forEach(bomb => {
            if (!bomb.exploded && this.lineIntersectsCircle(p1, p2, bomb)) {
                this.explodeBomb(bomb);
                // Reset combo when hitting a bomb
                this.resetCombo();
            }
        });
    }
    
    updateCombo(count) {
        // Increase combo counter
        this.comboCount += count;
        
        // Update or create combo timer
        if (this.comboTimer) {
            this.comboTimer.remove();
        }
        
        // Timer to reset combo after 2 seconds
        this.comboTimer = this.time.delayedCall(2000, () => {
            this.resetCombo();
        });
        
        // Display combo text if there is a combo
        if (this.comboCount > 1) {
            // Calculate bonus points for combo
            const bonusPoints = this.comboCount * 5;
            
            // Add bonus points
            this.score += bonusPoints;
            this.scoreText.setText(`Score: ${this.score}`);
            
            // Display combo text
            this.comboText.setText(`COMBO x${this.comboCount}!\n+${bonusPoints}`);
            this.comboText.setAlpha(1);
            
            // Animate combo text
            this.tweens.add({
                targets: this.comboText,
                scale: { from: 1.5, to: 1 },
                alpha: { from: 1, to: 0 },
                duration: 1000,
                ease: 'Power2'
            });
        }
    }
    
    resetCombo() {
        this.comboCount = 0;
        if (this.comboTimer) {
            this.comboTimer.remove();
            this.comboTimer = null;
        }
    }
    
    lineIntersectsCircle(p1, p2, circle) {
        // Distance from point to line
        const x1 = p1.x;
        const y1 = p1.y;
        const x2 = p2.x;
        const y2 = p2.y;
        const cx = circle.x;
        const cy = circle.y;
        const r = circle.displayWidth / 2;
        
        // Line vector
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        // Parameterized position of circle relative to line
        const t = ((cx - x1) * dx + (cy - y1) * dy) / (dx * dx + dy * dy);
        
        // Find closest point on line to circle center
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
        
        // Distance from closest point to circle center
        const distance = Math.sqrt((closestX - cx) ** 2 + (closestY - cy) ** 2);
        
        return distance <= r;
    }
    
    spawnBerry() {
        if (this.gameOver) return;
        
        const { width, height } = this.cameras.main;
        
        // Choose random berry from available ones
        const berryTypes = skins.default.assets;
        const berryType = berryTypes[Phaser.Math.Between(0, berryTypes.length - 1)];
        
        // Create berry
        const x = Phaser.Math.Between(100, width - 100);
        const berry = this.add.image(x, height + 50, berryType);
        
        // Set size depending on type
        const scale = Phaser.Math.FloatBetween(0.6, 1.0);
        berry.setScale(scale);
        
        // Add physics
        this.physics.add.existing(berry);
        berry.body.setVelocity(
            Phaser.Math.Between(-200, 200),
            Phaser.Math.Between(-800, -600)
        );
        berry.body.setGravityY(300);
        
        // Add properties for state tracking
        berry.sliced = false;
        
        // Add to group
        this.berriesGroup.add(berry);
    }
    
    spawnBomb() {
        if (this.gameOver) return;
        
        const { width, height } = this.cameras.main;
        
        // Create bomb
        const x = Phaser.Math.Between(100, width - 100);
        const bomb = this.add.image(x, height + 50, 'bomb');
        
        // Set size
        bomb.setScale(0.7);
        
        // Add physics
        this.physics.add.existing(bomb);
        bomb.body.setVelocity(
            Phaser.Math.Between(-150, 150),
            Phaser.Math.Between(-700, -500)
        );
        bomb.body.setGravityY(300);
        
        // Add properties for state tracking
        bomb.exploded = false;
        
        // Add to group
        this.bombsGroup.add(bomb);
    }
    
    sliceBerry(berry) {
        // Mark berry as sliced
        berry.sliced = true;
        
        // Create two berry halves with different movement directions
        // Use smaller copies of the original berry instead of masks
        const leftHalf = this.add.image(berry.x - 10, berry.y, berry.texture.key)
            .setScale(berry.scaleX * 0.6);
        const rightHalf = this.add.image(berry.x + 10, berry.y, berry.texture.key)
            .setScale(berry.scaleX * 0.6);
            
        // Add physics to halves
        this.physics.add.existing(leftHalf);
        this.physics.add.existing(rightHalf);
        
        // Set velocities for halves
        leftHalf.body.setVelocity(berry.body.velocity.x - 150, berry.body.velocity.y - 50);
        rightHalf.body.setVelocity(berry.body.velocity.x + 150, berry.body.velocity.y - 50);
        leftHalf.body.setGravityY(400);
        rightHalf.body.setGravityY(400);
        
        // Add rotation
        leftHalf.body.setAngularVelocity(-300);
        rightHalf.body.setAngularVelocity(300);
        
        // Create splatter effect at slice point
        const splashIndex = Phaser.Math.Between(1, 4);
        const splash = this.add.image(berry.x, berry.y, `mark${splashIndex}`);
        splash.setScale(0.8); // Increase splatter size
        splash.setAlpha(0.9);
        
        // Choose splatter color based on berry type
        let tint;
        switch(berry.texture.key) {
            case 'blueberry': tint = 0x3498db; break;
            case 'strawberry': tint = 0xe74c3c; break;
            case 'cranberry': tint = 0xc0392b; break;
            case 'renderBerry': tint = 0x9b59b6; break;
            default: tint = 0xffffff;
        }
        splash.setTint(tint);
        
        // Add sliding down animation for splatter
        this.tweens.add({
            targets: splash,
            y: splash.y + 200, // Slide down
            alpha: { from: 0.9, to: 0 },
            duration: 2000, // Increase splatter lifetime
            ease: 'Power1',
            onComplete: () => {
                splash.destroy();
            }
        });
        
        // Add points
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
        
        // Destroy original berry
        berry.destroy();
        
        // Remove halves after some time
        this.time.delayedCall(2000, () => {
            leftHalf.destroy();
            rightHalf.destroy();
        });
    }
    
    explodeBomb(bomb) {
        // Mark bomb as exploded
        bomb.exploded = true;
        
        // Create explosion effect
        const explosion = this.add.image(bomb.x, bomb.y, 'explosion').setScale(0);
        
        // Explosion animation
        this.tweens.add({
            targets: explosion,
            scale: 2,
            alpha: { from: 1, to: 0 },
            duration: 500,
            onComplete: () => {
                explosion.destroy();
            }
        });
        
        // Decrease lives
        this.lives--;
        this.livesText.setText(`Lives: ${this.lives}`);
        
        // Check game over condition
        if (this.lives <= 0) {
            this.endGame();
        }
        
        // Destroy bomb
        bomb.destroy();
        
        // Camera shake effect
        this.cameras.main.shake(300, 0.02);
    }
    
    update() {
        // Update blade trail
        this.drawBladeTrail();
        
        // Remove objects that are off-screen
        this.cleanupObjects();
    }
    
    drawBladeTrail() {
        // Clear previous trail
        this.bladeGraphics.clear();
        
        // Check if too much time has passed since last movement
        const timeSinceLastMove = this.time.now - this.lastMoveTime;
        const isStationary = timeSinceLastMove > 300; // 300ms threshold
        
        // If no points or not slicing, draw a point
        if (this.trailPoints.length < 2 || !this.isSlicing) {
            if (this.trailPoints.length > 0 && isStationary) {
                // Draw a point when not moving
                this.bladeGraphics.fillStyle(this.bladeColor, 1);
                this.bladeGraphics.fillCircle(this.trailPoints[0].x, this.trailPoints[0].y, 8);
            }
            return;
        }
        
        // If cursor hasn't moved for a while but we have points, draw a point
        if (isStationary) {
            this.bladeGraphics.fillStyle(this.bladeColor, 1);
            this.bladeGraphics.fillCircle(this.trailPoints[0].x, this.trailPoints[0].y, 8);
            return;
        }
        
        // Draw blade trail
        for (let i = 0; i < this.trailPoints.length - 1; i++) {
            const p1 = this.trailPoints[i];
            const p2 = this.trailPoints[i + 1];
            
            // Calculate line direction
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const angle = Math.atan2(dy, dx);
            
            // Calculate normal to line
            const normalAngle = angle + Math.PI / 2;
            
            // Line width decreases with each point (fade effect)
            const lineWidth = 10 - i * 0.4;
            if (lineWidth <= 0) continue;
            
            // Draw line with decreasing thickness
            this.bladeGraphics.lineStyle(lineWidth, this.bladeColor, 1 - i * 0.05);
            this.bladeGraphics.beginPath();
            this.bladeGraphics.moveTo(p1.x, p1.y);
            this.bladeGraphics.lineTo(p2.x, p2.y);
            this.bladeGraphics.strokePath();
            
            // Add triangular tip at the beginning of the trail
            if (i === 0) {
                const tipLength = 15;
                const tipWidth = 8;
                
                // Calculate points for triangle
                const tipX1 = p1.x + Math.cos(angle - Math.PI) * tipLength;
                const tipY1 = p1.y + Math.sin(angle - Math.PI) * tipLength;
                const tipX2 = p1.x + Math.cos(normalAngle) * tipWidth;
                const tipY2 = p1.y + Math.sin(normalAngle) * tipWidth;
                const tipX3 = p1.x + Math.cos(normalAngle + Math.PI) * tipWidth;
                const tipY3 = p1.y + Math.sin(normalAngle + Math.PI) * tipWidth;
                
                // Draw triangle
                this.bladeGraphics.fillStyle(this.bladeColor, 1);
                this.bladeGraphics.beginPath();
                this.bladeGraphics.moveTo(p1.x, p1.y);
                this.bladeGraphics.lineTo(tipX2, tipY2);
                this.bladeGraphics.lineTo(tipX1, tipY1);
                this.bladeGraphics.lineTo(tipX3, tipY3);
                this.bladeGraphics.closePath();
                this.bladeGraphics.fillPath();
            }
        }
    }
    
    cleanupObjects() {
        const { height } = this.cameras.main;
        
        // Remove berries that are off the bottom of the screen
        this.berriesGroup.getChildren().forEach(berry => {
            if (berry.y > height + 100) {
                berry.destroy();
            }
        });
        
        // Remove bombs that are off the bottom of the screen
        this.bombsGroup.getChildren().forEach(bomb => {
            if (bomb.y > height + 100) {
                bomb.destroy();
            }
        });
    }
    
    endGame() {
        // Set game over flag
        this.gameOver = true;
        
        // Stop timers
        if (this.berryTimer) this.berryTimer.remove();
        if (this.bombTimer) this.bombTimer.remove();
        if (this.comboTimer) this.comboTimer.remove();
        
        // Save best score
        const saveData = saveManager.load();
        if (this.score > (saveData.highScore || 0)) {
            saveData.highScore = this.score;
            saveManager.save(saveData);
        }
        
        // Display game over screen
        const { width, height } = this.cameras.main;
        
        // Darkening overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        
        // "Game Over" text
        this.add.text(width / 2, height / 3, 'GAME OVER', {
            fontFamily: '"Impact", fantasy',
            fontSize: '64px',
            fill: '#FFFFFF',
            stroke: '#FF0000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Final score
        this.add.text(width / 2, height / 2, `Score: ${this.score}`, {
            fontFamily: '"Impact", fantasy',
            fontSize: '48px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);
        
        // "Play Again" button
        const restartButton = this.add.text(width / 2, height * 2/3, 'PLAY AGAIN', {
            fontFamily: '"Impact", fantasy',
            fontSize: '36px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            // Reset game over flag before restart
            this.gameOver = false;
            this.scene.restart();
        });
        
        // "Menu" button
        const menuButton = this.add.text(width / 2, height * 2/3 + 60, 'MENU', {
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
