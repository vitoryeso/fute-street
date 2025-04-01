/**
 * Sistema de Menu Modal
 * Responsável por gerenciar o menu de pausa e as opções de câmera
 */

import DEBUG from '../core/debug.js';
import { setCameraPosition } from './camera.js';

// Função para configurar o menu modal
export function configurarMenuModal() {
    DEBUG.log('ui', 'Configurando menu modal');
    
    const menuButton = document.getElementById('menu-button');
    const modalOverlay = document.getElementById('modal-overlay');
    const menuModal = document.getElementById('menu-modal');
    const btnContinuar = document.getElementById('btn-continuar');
    const cameraOptions = document.querySelectorAll('.camera-option');
    
    if (!menuButton || !modalOverlay || !menuModal) {
        DEBUG.error('ui', 'Elementos do menu modal não encontrados');
        return;
    }
    
    // Função para abrir o menu e pausar o jogo
    function abrirMenu() {
        DEBUG.log('ui', 'Abrindo menu modal');
        modalOverlay.style.display = 'block';
        menuModal.style.display = 'block';
        
        // Pausar o jogo
        if (window.gameState) {
            window.gameState.estadoAnterior = window.gameState.emAndamento;
            window.gameState.emAndamento = false;
        }
    }
    
    // Função para fechar o menu e retomar o jogo
    function fecharMenu() {
        DEBUG.log('ui', 'Fechando menu modal');
        modalOverlay.style.display = 'none';
        menuModal.style.display = 'none';
        
        // Retomar o jogo se estava em andamento antes
        if (window.gameState && window.gameState.estadoAnterior) {
            window.gameState.emAndamento = window.gameState.estadoAnterior;
        }
    }
    
    // Configurar evento de clique no botão hamburguer
    menuButton.addEventListener('click', abrirMenu);
    
    // Configurar evento de clique no botão continuar
    btnContinuar.addEventListener('click', fecharMenu);
    
    // Configurar opções de câmera
    cameraOptions.forEach(option => {
        option.addEventListener('click', () => {
            const cameraType = option.getAttribute('data-camera');
            
            // Atualizar seleção visual
            cameraOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Atualizar tipo de câmera e aplicar mudança
            if (window.gameState) {
                window.gameState.cameraMode = cameraType;
                setCameraPosition(cameraType);
                
                DEBUG.log('camera', `Câmera alterada para: ${cameraType}`);
                
                // Mostrar mensagem de feedback
                mostrarMensagem(`Câmera alterada para visão ${cameraType}`);
            }
        });
    });
    
    DEBUG.log('ui', 'Menu modal configurado com sucesso');
}

// Função para mostrar mensagem temporária
function mostrarMensagem(texto) {
    // Verificar se já existe uma mensagem
    let mensagem = document.getElementById('camera-feedback');
    
    if (!mensagem) {
        mensagem = document.createElement('div');
        mensagem.id = 'camera-feedback';
        mensagem.style.position = 'absolute';
        mensagem.style.bottom = '80px';
        mensagem.style.left = '50%';
        mensagem.style.transform = 'translateX(-50%)';
        mensagem.style.background = 'rgba(0, 0, 0, 0.7)';
        mensagem.style.color = 'white';
        mensagem.style.padding = '10px 20px';
        mensagem.style.borderRadius = '5px';
        mensagem.style.zIndex = '50';
        mensagem.style.transition = 'opacity 0.3s';
        
        document.body.appendChild(mensagem);
    }
    
    // Atualizar texto e exibir
    mensagem.textContent = texto;
    mensagem.style.opacity = '1';
    
    // Esconder após alguns segundos
    setTimeout(() => {
        mensagem.style.opacity = '0';
        setTimeout(() => {
            if (mensagem.parentNode) {
                mensagem.parentNode.removeChild(mensagem);
            }
        }, 300);
    }, 2000);
}

export default { configurarMenuModal }; 