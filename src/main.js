import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { ShopScene } from './scenes/ShopScene';
import { MenuScene } from './scenes/MenuScene';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#000000',
    scene: [MenuScene, GameScene, ShopScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
}); 