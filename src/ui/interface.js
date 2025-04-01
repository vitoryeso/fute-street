/**
 * Sistema de Interface do Usuário
 * Responsável por gerenciar os elementos da interface e botões
 */

import DEBUG from '../core/debug.js';
import { iniciarJogo } from '../game/initialization.js';
import { resetGameState } from '../core/gameState.js';
import { iniciarTemporizador } from '../core/gameState.js';
import { resetarBola } from '../game/players.js';

// Configurar os botões da interface
export function configurarBotoesUI() {
    DEBUG.log('ui', 'Configurando botões da interface');
    
    // Botão de jogar
    const btnJogar = document.getElementById('btn-jogar');
    if (btnJogar) {
        btnJogar.addEventListener('click', () => {
            DEBUG.log('ui', 'Botão JOGAR clicado');
            document.getElementById('menu-principal').classList.add('escondido');
            document.getElementById('tela-jogo').classList.remove('escondido');
            
            iniciarJogo();
        });
    } else {
        DEBUG.error('ui', 'Botão JOGAR não encontrado');
    }
    
    // Botão de loja
    const btnLoja = document.getElementById('btn-loja');
    if (btnLoja) {
        btnLoja.addEventListener('click', () => {
            DEBUG.log('ui', 'Botão LOJA clicado');
            document.getElementById('menu-principal').classList.add('escondido');
            document.getElementById('tela-loja').classList.remove('escondido');
        });
    } else {
        DEBUG.error('ui', 'Botão LOJA não encontrado');
    }
    
    // Botão de voltar da loja
    const btnVoltarLoja = document.getElementById('btn-voltar-loja');
    if (btnVoltarLoja) {
        btnVoltarLoja.addEventListener('click', () => {
            DEBUG.log('ui', 'Botão VOLTAR da loja clicado');
            document.getElementById('tela-loja').classList.add('escondido');
            document.getElementById('menu-principal').classList.remove('escondido');
        });
    } else {
        DEBUG.error('ui', 'Botão VOLTAR da loja não encontrado');
    }
    
    // Botão de sair do jogo
    const btnSair = document.querySelector('.btn-sair');
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            DEBUG.log('ui', 'Botão SAIR clicado');
            document.getElementById('tela-jogo').classList.add('escondido');
            document.getElementById('menu-principal').classList.remove('escondido');
            
            // Pausar o jogo
            window.gameState.emAndamento = false;
        });
    } else {
        DEBUG.error('ui', 'Botão SAIR não encontrado');
    }
    
    // Botões da tela de fim de jogo
    const btnJogarNovamente = document.getElementById('btn-jogar-novamente');
    if (btnJogarNovamente) {
        btnJogarNovamente.addEventListener('click', () => {
            DEBUG.log('ui', 'Botão JOGAR NOVAMENTE clicado');
            document.getElementById('tela-fim-jogo').classList.add('escondido');
            document.getElementById('tela-jogo').classList.remove('escondido');
            
            // Reiniciar o jogo
            resetGameState();
            
            // Reiniciar temporizador
            iniciarTemporizador();
            
            // Resetar posições
            resetarBola();
        });
    } else {
        DEBUG.error('ui', 'Botão JOGAR NOVAMENTE não encontrado');
    }
    
    const btnVoltarMenu = document.getElementById('btn-voltar-menu');
    if (btnVoltarMenu) {
        btnVoltarMenu.addEventListener('click', () => {
            DEBUG.log('ui', 'Botão VOLTAR MENU clicado');
            document.getElementById('tela-fim-jogo').classList.add('escondido');
            document.getElementById('menu-principal').classList.remove('escondido');
        });
    } else {
        DEBUG.error('ui', 'Botão VOLTAR MENU não encontrado');
    }
    
    // Adicionar configuração do menu hamburger
    configurarMenuHamburguer();
    
    DEBUG.log('ui', 'Botões da interface configurados com sucesso');
    
    // Atualizar texto do botão jogar para "JOGAR"
    if (btnJogar) {
        btnJogar.disabled = false;
        btnJogar.textContent = 'JOGAR';
    }
}

// Configurar o menu hamburger e o menu modal
function configurarMenuHamburguer() {
    DEBUG.log('ui', 'Configurando menu hamburger');
    
    const menuHamburguer = document.getElementById('menu-hamburguer');
    const menuModal = document.getElementById('menu-modal');
    const btnRetomar = document.getElementById('btn-retomar');
    const btnSairMenu = document.getElementById('btn-sair-menu');
    const cameraOptions = document.querySelectorAll('.camera-options li');
    
    if (!menuHamburguer || !menuModal) {
        DEBUG.error('ui', 'Elementos do menu hamburger não encontrados');
        return;
    }
    
    // Abrir menu ao clicar no hamburguer
    menuHamburguer.addEventListener('click', () => {
        DEBUG.log('ui', 'Menu hamburger clicado, abrindo menu modal');
        menuModal.classList.remove('escondido');
        
        // Pausar o jogo
        if (window.gameState) {
            window.gameState.emAndamento = false;
        }
    });
    
    // Retomar jogo
    if (btnRetomar) {
        btnRetomar.addEventListener('click', () => {
            DEBUG.log('ui', 'Retomando jogo');
            menuModal.classList.add('escondido');
            
            // Retomar o jogo
            if (window.gameState) {
                window.gameState.emAndamento = true;
            }
        });
    }
    
    // Sair para o menu principal
    if (btnSairMenu) {
        btnSairMenu.addEventListener('click', () => {
            DEBUG.log('ui', 'Saindo para o menu principal');
            menuModal.classList.add('escondido');
            document.getElementById('tela-jogo').classList.add('escondido');
            document.getElementById('menu-principal').classList.remove('escondido');
            
            // Manter o jogo pausado
            if (window.gameState) {
                window.gameState.emAndamento = false;
            }
        });
    }
    
    // Configurar opções de câmera
    cameraOptions.forEach(option => {
        option.addEventListener('click', () => {
            const cameraType = option.getAttribute('data-camera');
            DEBUG.log('ui', `Câmera alterada para: ${cameraType}`);
            
            // Remover classe active de todas as opções
            cameraOptions.forEach(op => op.classList.remove('active'));
            
            // Adicionar classe active à opção selecionada
            option.classList.add('active');
            
            // Atualizar tipo de câmera no estado do jogo
            if (window.gameState) {
                window.gameState.cameraMode = cameraType;
            }
            
            // Chamar função para mudar câmera
            import('../ui/camera.js').then(module => {
                module.setCameraPosition(cameraType);
                module.showCameraChangeMessage(cameraType);
            });
        });
    });
    
    DEBUG.log('ui', 'Menu hamburger configurado com sucesso');
}

export default { configurarBotoesUI }; 