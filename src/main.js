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
    }
};

// Создаем игру, но не инициализируем её сразу
let game = null;

// Функция для запуска игры
function startGame() {
    console.log('Starting game...');
    
    // Создаем экземпляр игры
    game = new Phaser.Game(config);
    
    // Добавляем обработчик для отслеживания состояния загрузки
    game.events.on('bootcomplete', () => {
        console.log('BootScene complete, transitioning to MenuScene');
    });
}

// Делаем функцию запуска игры глобальной
window.startGame = startGame;

// Обработчик изменения размера окна
window.addEventListener('resize', () => {
    if (game) {
        game.scale.resize(window.innerWidth, window.innerHeight);
    }
}); 