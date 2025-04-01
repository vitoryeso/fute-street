/**
 * Sistema de Gerenciamento de Estado do Jogo
 * Centraliza o estado do jogo e métodos para alterá-lo
 */

import DEBUG from './debug.js';

// Configurações para diferentes posições de câmera
export const cameraPositions = {
    alta: {
        position: { x: 0, y: 18, z: 25 },
        description: "Visão Alta - Vista panorâmica do campo"
    },
    media: {
        position: { x: 0, y: 10, z: 15 },
        description: "Visão Média - Equilíbrio entre campo e ação"
    },
    baixa: {
        position: { x: 0, y: 6, z: 10 },
        description: "Visão Baixa - Mais próximo da ação"
    }
};

// Estado global do jogo (mantido no objeto window para compatibilidade)
const initGameState = () => {
    window.gameState = {
        tela: 'menu',
        emAndamento: false,
        tempoRestante: 60,
        placar: { jogador: 0, cpu: 0 },
        jogadorAtivo: 0,
        skinPremium: false,
        modo3D: true,
        debug: DEBUG.enabled,
        initializing: false,
        initialized: false,
        cameraMode: 'media' // Modo padrão de câmera
    };

    // Inicializar gameControls global para o joystick
    window.gameControls = {
        joystick: { x: 0, y: 0, active: false },
        buttons: {},
        keyboard: {
            up: false,
            down: false,
            left: false,
            right: false,
            space: false,
            shift: false
        }
    };

    return window.gameState;
};

// Reiniciar o estado do jogo para um novo jogo
export function resetGameState() {
    window.gameState.placar = { jogador: 0, cpu: 0 };
    window.gameState.tempoRestante = 60;
    window.gameState.emAndamento = true;
    
    atualizarTextoTempo();
    atualizarPlacar();
}

// Marcar um gol para um time
export function marcarGol(time) {
    DEBUG.log('game', `GOL do ${time}!`);
    // Atualizar placar
    window.gameState.placar[time] += 1;
    
    // Importações dinâmicas para evitar referências circulares
    import('../ui/effects.js').then(module => {
        module.criarEfeitoGol(time);
    });
    
    import('../game/players.js').then(module => {
        module.resetarBola();
    });
    
    // Atualizar placar na UI
    atualizarPlacar();
}

// Finalizar o jogo quando o tempo acabar
export function finalizarJogo() {
    DEBUG.log('game', 'Finalizando jogo');
    
    window.gameState.emAndamento = false;
    
    // Mostrar tela de fim de jogo
    const telaFimJogo = document.getElementById('tela-fim-jogo');
    const telaJogo = document.getElementById('tela-jogo');
    if (telaFimJogo && telaJogo) {
        telaJogo.classList.add('escondido');
        telaFimJogo.classList.remove('escondido');
    }
    
    // Atualizar texto de resultado
    const resultadoEl = document.getElementById('resultado-jogo');
    if (resultadoEl) {
        let mensagem = `Resultado final: ${window.gameState.placar.jogador} x ${window.gameState.placar.cpu}`;
        
        if (window.gameState.placar.jogador > window.gameState.placar.cpu) {
            mensagem += " - VOCÊ VENCEU!";
        } else if (window.gameState.placar.jogador < window.gameState.placar.cpu) {
            mensagem += " - VOCÊ PERDEU!";
        } else {
            mensagem += " - EMPATE!";
        }
        
        resultadoEl.textContent = mensagem;
    }
    
    DEBUG.log('game', 'Jogo finalizado com placar: ' + 
              window.gameState.placar.jogador + ' x ' + window.gameState.placar.cpu);
}

// Atualizar texto do tempo na UI
export function atualizarTextoTempo() {
    const placarEl = document.getElementById('placar-texto');
    if (placarEl) {
        placarEl.textContent = `${window.gameState.placar.jogador} x ${window.gameState.placar.cpu} (${window.gameState.tempoRestante}s)`;
    }
}

// Atualizar o placar na interface
export function atualizarPlacar() {
    const placarEl = document.getElementById('placar-texto');
    if (placarEl) {
        placarEl.textContent = `${window.gameState.placar.jogador} x ${window.gameState.placar.cpu} (${window.gameState.tempoRestante}s)`;
    }
}

// Iniciar o temporizador do jogo
export function iniciarTemporizador() {
    DEBUG.log('game', 'Iniciando temporizador de jogo');
    
    if (window.gameTimer) {
        clearInterval(window.gameTimer);
        DEBUG.log('game', 'Temporizador anterior limpo');
    }
    
    window.gameState.tempoRestante = 60;
    atualizarTextoTempo();
    
    window.gameTimer = setInterval(() => {
        if (!window.gameState.emAndamento) {
            DEBUG.log('game', 'Jogo pausado, temporizador em pausa');
            return;
        }
        
        window.gameState.tempoRestante--;
        atualizarTextoTempo();
        
        if (window.gameState.tempoRestante <= 0) {
            clearInterval(window.gameTimer);
            finalizarJogo();
        }
    }, 1000);
    
    DEBUG.log('game', 'Temporizador iniciado');
}

export { initGameState };
export default { initGameState, cameraPositions }; 