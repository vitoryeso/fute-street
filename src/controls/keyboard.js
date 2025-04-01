/**
 * Sistema de Controles de Teclado
 * Responsável por gerenciar as entradas de teclado para o jogo
 */

import DEBUG from '../core/debug.js';

// Configurar controles de teclado para desktop
export function configurarControlesTeclado() {
    DEBUG.log('controls', 'Configurando controles de teclado');
    
    // Adicionar event listeners para teclado
    window.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
                window.gameControls.keyboard.up = true;
                break;
            case 'ArrowDown':
            case 's':
                window.gameControls.keyboard.down = true;
                break;
            case 'ArrowLeft':
            case 'a':
                window.gameControls.keyboard.left = true;
                break;
            case 'ArrowRight':
            case 'd':
                window.gameControls.keyboard.right = true;
                break;
            case ' ':  // Espaço
                window.gameControls.keyboard.space = true;
                break;
            case 'Shift':
                window.gameControls.keyboard.shift = true;
                break;
        }
    });
    
    window.addEventListener('keyup', (e) => {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
                window.gameControls.keyboard.up = false;
                break;
            case 'ArrowDown':
            case 's':
                window.gameControls.keyboard.down = false;
                break;
            case 'ArrowLeft':
            case 'a':
                window.gameControls.keyboard.left = false;
                break;
            case 'ArrowRight':
            case 'd':
                window.gameControls.keyboard.right = false;
                break;
            case ' ':  // Espaço
                window.gameControls.keyboard.space = false;
                break;
            case 'Shift':
                window.gameControls.keyboard.shift = false;
                break;
        }
    });
    
    DEBUG.log('controls', 'Controles de teclado configurados');
    
    return true;
}

export default { configurarControlesTeclado }; 