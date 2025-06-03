import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { GameScene } from './scenes/GameScene';
import { ShopScene } from './scenes/ShopScene';
import { MenuScene } from './scenes/MenuScene';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#000000',
    scene: [BootScene, MenuScene, GameScene, ShopScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);

// Hide the initial HTML loading overlay once Phaser is ready
game.events.on('ready', () => {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
});

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
}); 