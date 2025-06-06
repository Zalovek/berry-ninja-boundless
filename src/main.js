import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { GameScene } from './scenes/GameScene';
import ShopScene from './scenes/ShopScene';
import MenuScene from './scenes/MenuScene';
import SettingsScene from './scenes/SettingsScene';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#000000',
    scene: [BootScene, MenuScene, GameScene, ShopScene, SettingsScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    audio: {
        disableWebAudio: false,
        noAudio: false
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    // Add scene transition configuration
    sceneConfig: {
        // Use clean shutdown and initialization for scene transitions
        transitionOut: function(targetScene, duration) {
            this.cameras.main.fadeOut(duration);
        },
        transitionIn: function(targetScene, duration) {
            this.cameras.main.fadeIn(duration);
        }
    }
};

// Create game instance
let game = null;

// Function to start game
function startGame() {
    // Create game instance
    game = new Phaser.Game(config);

    // Add global event listener for boot complete
    game.events.on('bootcomplete', () => {
        // Game boot complete
    });
    
    // Add error handler for the game
    window.addEventListener('error', function(event) {
        console.error('Game error:', event.error);
    });
}

// Make start function globally available
window.startGame = startGame;
        
// Resize handler
window.addEventListener('resize', () => {
    if (game) {
        game.scale.resize(window.innerWidth, window.innerHeight);
    }
}); 