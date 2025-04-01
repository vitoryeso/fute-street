/**
 * Sistema de Controle de Câmera
 * Responsável por gerenciar as diferentes visualizações de câmera no jogo
 */

import DEBUG from '../core/debug.js';
import { cameraPositions } from '../core/gameState.js';

// Função para definir a posição da câmera
export function setCameraPosition(mode) {
    if (!window.threejs || !window.threejs.camera) {
        DEBUG.warn('camera', 'Câmera não está disponível');
        return;
    }
    
    const cameraSetting = cameraPositions[mode];
    if (!cameraSetting) return;
    
    // Armazenar a posição base da câmera para uso posterior
    window.threejs.baseCameraPosition = cameraSetting.position;
    
    // Se a câmera estiver em modo orbital, não alteramos diretamente
    if (window.threejs.orbitControls) {
        window.threejs.camera.position.set(
            cameraSetting.position.x,
            cameraSetting.position.y,
            cameraSetting.position.z
        );
        window.threejs.orbitControls.update();
    } else {
        // Caso contrário, define a nova posição
        // A função atualizarJogo3D() vai lidar com o ajuste fino
        window.threejs.camera.position.set(
            cameraSetting.position.x,
            cameraSetting.position.y,
            cameraSetting.position.z
        );
    }
    
    // Focar a câmera no centro do campo
    window.threejs.camera.lookAt(0, 0, 0);
}

// Função para mostrar mensagem de troca de câmera
export function showCameraChangeMessage(mode) {
    const cameraSetting = cameraPositions[mode];
    if (!cameraSetting) return;
    
    // Criar elemento para mensagem
    const messageEl = document.createElement('div');
    messageEl.className = 'camera-change-message';
    messageEl.textContent = cameraSetting.description;
    messageEl.style.position = 'absolute';
    messageEl.style.top = '50%';
    messageEl.style.left = '50%';
    messageEl.style.transform = 'translate(-50%, -50%)';
    messageEl.style.background = 'rgba(0, 0, 0, 0.7)';
    messageEl.style.color = 'white';
    messageEl.style.padding = '10px 20px';
    messageEl.style.borderRadius = '5px';
    messageEl.style.zIndex = '50';
    messageEl.style.opacity = '0';
    messageEl.style.transition = 'opacity 0.3s';
    
    document.getElementById('ui-overlay').appendChild(messageEl);
    
    // Animar aparecimento e desaparecimento
    setTimeout(() => { messageEl.style.opacity = '1'; }, 50);
    setTimeout(() => { messageEl.style.opacity = '0'; }, 2000);
    setTimeout(() => { messageEl.remove(); }, 2500);
}

// Função vazia para evitar erro nas chamadas existentes
export function setupCameraMenu() {
    DEBUG.log('ui', 'Configuração de menu de câmeras desativada - usando a nova implementação');
}

export default { setCameraPosition, showCameraChangeMessage, setupCameraMenu};