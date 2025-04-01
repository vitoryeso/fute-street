/**
 * Sistema de Controles Móveis
 * Responsável por gerenciar joystick virtual e controles de toque
 */

import DEBUG from '../core/debug.js';

// Configurar o joystick virtual e botões de toque
export function configurarControlesMobile() {
    DEBUG.log('controls', 'Configurando controles móveis');
    
    const joystickArea = document.getElementById('joystick-area');
    
    if (!joystickArea) {
        DEBUG.warn('controls', 'Elemento joystick-area não encontrado - adicionando dinamicamente');
        const uiOverlay = document.getElementById('ui-overlay');
        
        if (!uiOverlay) {
            DEBUG.error('controls', 'Elemento ui-overlay não encontrado - não é possível adicionar joystick');
            return;
        }
        
        const joystickDiv = document.createElement('div');
        joystickDiv.id = 'joystick-area';
        uiOverlay.appendChild(joystickDiv);
        
        // Aplicar estilo
        joystickDiv.style.position = 'absolute';
        joystickDiv.style.bottom = '30px';
        joystickDiv.style.left = '30px';
        joystickDiv.style.width = '120px';
        joystickDiv.style.height = '120px';
        joystickDiv.style.background = 'rgba(255,255,255,0.2)';
        joystickDiv.style.borderRadius = '50%';
        joystickDiv.style.pointerEvents = 'auto';
    }
    
    // Tentar novamente após criar
    const joystickElement = document.getElementById('joystick-area');
    
    if (!joystickElement) {
        DEBUG.error('controls', 'Não foi possível encontrar ou criar joystick-area');
        return;
    }
    
    // Criar elemento para o "polegar" do joystick
    let joystickThumb = document.getElementById('joystick-thumb');
    if (!joystickThumb) {
        joystickThumb = document.createElement('div');
        joystickThumb.id = 'joystick-thumb';
        joystickThumb.style.position = 'absolute';
        joystickThumb.style.top = '50%';
        joystickThumb.style.left = '50%';
        joystickThumb.style.transform = 'translate(-50%, -50%)';
        joystickThumb.style.width = '40px';
        joystickThumb.style.height = '40px';
        joystickThumb.style.background = 'rgba(255,255,255,0.5)';
        joystickThumb.style.borderRadius = '50%';
        joystickElement.appendChild(joystickThumb);
    }
    
    // Variáveis para o joystick
    const joystick = {
        active: false,
        startX: 0,
        startY: 0,
        x: 0,
        y: 0
    };
    
    // Event listeners para o joystick
    joystickElement.addEventListener('mousedown', handleStart);
    joystickElement.addEventListener('touchstart', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
    
    function handleStart(e) {
        DEBUG.log('controls', 'Joystick ativado');
        
        joystick.active = true;
        window.gameControls.joystick.active = true;
        
        const rect = joystickElement.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const pos = getEventPosition(e);
        
        joystick.startX = centerX;
        joystick.startY = centerY;
        joystick.x = 0;
        joystick.y = 0;
        
        // Atualizar no objeto global
        window.gameControls.joystick.x = 0;
        window.gameControls.joystick.y = 0;
        
        joystickThumb.style.transform = `translate(-50%, -50%)`;
        
        // Prevenir comportamento padrão para evitar efeitos indesejados no navegador
        e.preventDefault();
    }
    
    function handleMove(e) {
        if (!joystick.active) return;
        
        const rect = joystickElement.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const pos = getEventPosition(e);
        if (!pos) return;
        
        // Calcular o deslocamento
        const touchX = pos.x - rect.left;
        const touchY = pos.y - rect.top;
        
        // Calcular vetor do centro para o toque
        let dx = touchX - centerX;
        let dy = touchY - centerY;
        
        // Limitar ao raio do joystick
        const radius = rect.width / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > radius) {
            const angle = Math.atan2(dy, dx);
            dx = Math.cos(angle) * radius;
            dy = Math.sin(angle) * radius;
        }
        
        // Normalizar para valores entre -1 e 1
        joystick.x = dx / radius;
        joystick.y = dy / radius;
        
        // Atualizar no objeto global
        window.gameControls.joystick.x = joystick.x;
        window.gameControls.joystick.y = joystick.y;
        
        // Log de debug apenas se o joystick tiver movimento significativo
        if (Math.abs(joystick.x) > 0.1 || Math.abs(joystick.y) > 0.1) {
            DEBUG.log('controls', `Joystick: x=${joystick.x.toFixed(2)}, y=${joystick.y.toFixed(2)}`);
        }
        
        // Atualizar visualmente o joystick
        joystickThumb.style.transform = `translate(calc(${dx}px - 50%), calc(${dy}px - 50%))`;
        
        // Prevenir comportamento padrão para evitar efeitos indesejados no navegador
        e.preventDefault();
    }
    
    function handleEnd(e) {
        if (!joystick.active) return;
        
        DEBUG.log('controls', 'Joystick desativado');
        
        joystick.active = false;
        window.gameControls.joystick.active = false;
        joystick.x = 0;
        joystick.y = 0;
        
        // Atualizar no objeto global
        window.gameControls.joystick.x = 0;
        window.gameControls.joystick.y = 0;
        
        // Resetar posição visual
        joystickThumb.style.transform = `translate(-50%, -50%)`;
    }
    
    function getEventPosition(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.clientX !== undefined) {
            return { x: e.clientX, y: e.clientY };
        }
        return null;
    }
    
    // Configurar botões de ação
    const actionButtons = document.querySelectorAll('.btn-acao');
    
    if (actionButtons.length === 0) {
        DEBUG.warn('controls', 'Botões de ação não encontrados - adicionando dinamicamente');
        
        const uiOverlay = document.getElementById('ui-overlay');
        if (!uiOverlay) {
            DEBUG.error('controls', 'Elemento ui-overlay não encontrado - não é possível adicionar botões');
            return;
        }
        
        // Adicionar botão de passe
        const btnPasse = document.createElement('div');
        btnPasse.className = 'btn-acao';
        btnPasse.setAttribute('data-action', 'passe');
        btnPasse.innerText = 'P';
        btnPasse.style.position = 'absolute';
        btnPasse.style.bottom = '30px';
        btnPasse.style.right = '30px';
        btnPasse.style.width = '60px';
        btnPasse.style.height = '60px';
        btnPasse.style.background = 'rgba(255,255,255,0.3)';
        btnPasse.style.borderRadius = '50%';
        btnPasse.style.display = 'flex';
        btnPasse.style.alignItems = 'center';
        btnPasse.style.justifyContent = 'center';
        btnPasse.style.fontWeight = 'bold';
        btnPasse.style.pointerEvents = 'auto';
        uiOverlay.appendChild(btnPasse);
        
        // Adicionar botão de chute
        const btnChute = document.createElement('div');
        btnChute.className = 'btn-acao';
        btnChute.id = 'btn-chute';
        btnChute.setAttribute('data-action', 'chute');
        btnChute.innerText = 'C';
        btnChute.style.position = 'absolute';
        btnChute.style.bottom = '100px';
        btnChute.style.right = '30px';
        btnChute.style.width = '60px';
        btnChute.style.height = '60px';
        btnChute.style.background = 'rgba(255,255,255,0.3)';
        btnChute.style.borderRadius = '50%';
        btnChute.style.display = 'flex';
        btnChute.style.alignItems = 'center';
        btnChute.style.justifyContent = 'center';
        btnChute.style.fontWeight = 'bold';
        btnChute.style.pointerEvents = 'auto';
        uiOverlay.appendChild(btnChute);
    }
    
    // Configurar novamente após criar
    const buttons = document.querySelectorAll('.btn-acao');
    buttons.forEach(button => {
        if (button) {
            const action = button.getAttribute('data-action');
            
            // Suporte para mouse e touch
            button.addEventListener('mousedown', e => {
                DEBUG.log('controls', `Botão ${action} pressionado`);
                window.gameControls.buttons[action] = true;
                e.preventDefault();
            });
            
            button.addEventListener('touchstart', e => {
                DEBUG.log('controls', `Botão ${action} tocado`);
                window.gameControls.buttons[action] = true;
                e.preventDefault();
            });
            
            button.addEventListener('mouseup', () => {
                DEBUG.log('controls', `Botão ${action} liberado`);
                window.gameControls.buttons[action] = false;
            });
            
            button.addEventListener('touchend', () => {
                DEBUG.log('controls', `Botão ${action} liberado (touch)`);
                window.gameControls.buttons[action] = false;
            });
        }
    });
    
    DEBUG.log('controls', 'Controles móveis configurados com sucesso');
}

export default { configurarControlesMobile }; 