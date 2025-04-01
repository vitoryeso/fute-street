/**
 * Loop Principal do Jogo
 * Responsável pelas atualizações de estado e renderização a cada frame
 */

import DEBUG from '../core/debug.js';
import Physics from '../core/physics.js';
import { calcularDistancia } from '../core/physics.js';
import { finalizarJogo } from '../core/gameState.js';
import { criarEfeitoChute } from '../ui/effects.js';

// Função para atualizar o jogo 3D com física mais avançada
export function atualizarJogo3D(scene, deltaTime) {
    if (!window.threejs || !window.threejs.mainPlayer || !window.threejs.ball) {
        DEBUG.warn('game', 'Objetos do jogo não inicializados completamente');
        return;
    }
    
    // Multiplicador para suavizar movimento baseado no tempo delta
    const smoothFactor = deltaTime * 60; // Normalizar para ~60 FPS
    
    // Obter input do jogador
    const joystickX = window.gameControls.joystick.x;
    const joystickY = window.gameControls.joystick.y;
    
    // Também suportar controles de teclado
    if (window.gameControls.keyboard.left) window.gameControls.joystick.x = -1;
    if (window.gameControls.keyboard.right) window.gameControls.joystick.x = 1;
    if (window.gameControls.keyboard.up) window.gameControls.joystick.y = -1;
    if (window.gameControls.keyboard.down) window.gameControls.joystick.y = 1;
    if (window.gameControls.keyboard.space) window.gameControls.buttons.chute = true;
    if (window.gameControls.keyboard.shift) window.gameControls.buttons.passe = true;
    
    // Mover jogador principal com base no joystick ou teclado
    if (Math.abs(window.gameControls.joystick.x) > 0.1 || Math.abs(window.gameControls.joystick.y) > 0.1) {
        // Calculando a velocidade baseada no joystick, ajustada pelo tempo
        const speedFactor = 0.15 * smoothFactor;
        const dx = window.gameControls.joystick.x * speedFactor;
        const dz = window.gameControls.joystick.y * speedFactor;
        
        // Rotacionar o jogador na direção do movimento
        const angle = Math.atan2(window.gameControls.joystick.y, window.gameControls.joystick.x);
        window.threejs.mainPlayer.rotation.y = angle;
        
        // Mover o jogador
        window.threejs.mainPlayer.position.x += dx;
        window.threejs.mainPlayer.position.z += dz;
        
        // Limitar posição dentro do campo
        window.threejs.mainPlayer.position.x = Math.max(-9, Math.min(9, window.threejs.mainPlayer.position.x));
        window.threejs.mainPlayer.position.z = Math.max(-14, Math.min(14, window.threejs.mainPlayer.position.z));
        
        DEBUG.log('controls', 'Jogador movido para:', window.threejs.mainPlayer.position);
    }
    
    // Verificar colisão entre o jogador principal e a bola
    Physics.checkBallPlayerCollision(window.threejs.ball, window.threejs.mainPlayer);
    
    // Verificar colisões da bola com as paredes
    Physics.checkBallWallCollision(window.threejs.ball, window.threejs.paredes);
    
    // Atualizar física da bola
    Physics.updateBallPhysics(window.threejs.ball);
    
    // Verificação de gols - bola cruzou a linha?
    if (Math.abs(window.threejs.ball.position.x) < 2) {
        // Gol superior (do jogador)
        if (window.threejs.ball.position.z < -14) {
            // Importar dinamicamente para evitar dependência circular
            import('../core/gameState.js').then(module => {
                module.marcarGol('jogador');
            });
        }
        
        // Gol inferior (do CPU)
        if (window.threejs.ball.position.z > 14) {
            import('../core/gameState.js').then(module => {
                module.marcarGol('cpu');
            });
        }
    }
    
    // Movimentação básica de IA para os jogadores do time vermelho
    if (window.threejs.redTeam && window.threejs.redTeam.length > 0) {
        // Encontrar o jogador vermelho mais próximo da bola
        let jogadorMaisProximo = null;
        let distanciaMinima = Infinity;
        
        window.threejs.redTeam.forEach(jogador => {
            const distancia = calcularDistancia(jogador.position, window.threejs.ball.position);
            if (distancia < distanciaMinima) {
                distanciaMinima = distancia;
                jogadorMaisProximo = jogador;
            }
        });
        
        // Movimentar o jogador mais próximo em direção à bola
        if (jogadorMaisProximo && distanciaMinima > 1) {
            const direcaoX = window.threejs.ball.position.x - jogadorMaisProximo.position.x;
            const direcaoZ = window.threejs.ball.position.z - jogadorMaisProximo.position.z;
            
            // Normalizar direção
            const distancia = Math.sqrt(direcaoX * direcaoX + direcaoZ * direcaoZ);
            const dirNormX = direcaoX / distancia;
            const dirNormZ = direcaoZ / distancia;
            
            // Mover em direção à bola com velocidade reduzida, ajustada pelo tempo
            const speedFactor = 0.05 * smoothFactor;
            jogadorMaisProximo.position.x += dirNormX * speedFactor;
            jogadorMaisProximo.position.z += dirNormZ * speedFactor;
            
            // Rotacionar o jogador na direção do movimento
            const anguloRotacao = Math.atan2(dirNormZ, dirNormX);
            jogadorMaisProximo.rotation.y = anguloRotacao;
        }
        
        // Se um jogador adversário está próximo da bola, verificar colisão e possivelmente chutar
        if (jogadorMaisProximo && distanciaMinima < 1) {
            // Verificar colisão com a bola
            const colisao = Physics.checkBallPlayerCollision(window.threejs.ball, jogadorMaisProximo);
            
            if (colisao) {
                // Probabilidade aleatória de chutar (para não ser muito preciso)
                if (Math.random() < 0.03) {  // 3% de chance a cada frame
                    // Direcionar chute para o gol do jogador (parte superior)
                    const direcaoGolX = 0 - jogadorMaisProximo.position.x;
                    const direcaoGolZ = -14 - jogadorMaisProximo.position.z;
                    
                    // Normalizar
                    const distanciaGol = Math.sqrt(direcaoGolX * direcaoGolX + direcaoGolZ * direcaoGolZ);
                    const dirGolNormX = direcaoGolX / distanciaGol;
                    const dirGolNormZ = direcaoGolZ / distanciaGol;
                    
                    window.threejs.ballPhysics.velocity.x = dirGolNormX * 0.2;
                    window.threejs.ballPhysics.velocity.z = dirGolNormZ * 0.2;
                    
                    // Adicionar um pouco de imprecisão
                    window.threejs.ballPhysics.velocity.x += (Math.random() - 0.5) * 0.1;
                    
                    // Efeito visual
                    criarEfeitoChute(window.threejs.ball.position);
                    
                    DEBUG.log('ai', 'Bot chutou a bola!', window.threejs.ballPhysics.velocity);
                }
            }
        }
    }
    
    // Atualizar a posição da câmera para seguir o jogador e a bola
    if (window.threejs.camera && !window.threejs.orbitControls) {
        // Posição intermediária entre o jogador e a bola
        const targetX = (window.threejs.mainPlayer.position.x * 0.7 + window.threejs.ball.position.x * 0.3);
        const targetZ = (window.threejs.mainPlayer.position.z * 0.7 + window.threejs.ball.position.z * 0.3);
        
        // Obter posição base de acordo com o modo da câmera
        const baseCameraPos = window.threejs.baseCameraPosition || { x: 0, y: 10, z: 15 };
        
        // Mover suavemente a câmera (interpolação)
        const cameraSpeed = 0.05 * smoothFactor;
        window.threejs.camera.position.x += (targetX + baseCameraPos.x - window.threejs.camera.position.x) * cameraSpeed;
        window.threejs.camera.position.z += (targetZ + baseCameraPos.z - window.threejs.camera.position.z) * cameraSpeed;
        
        // Manter altura fixa baseada na configuração
        window.threejs.camera.position.y = baseCameraPos.y;
        
        // Manter a câmera olhando para o centro da ação
        window.threejs.camera.lookAt(targetX, 0, targetZ);
    }
    
    // Limpar estados de botão de teclado após o quadro
    window.gameControls.buttons.chute = false;
    window.gameControls.buttons.passe = false;
    window.gameControls.keyboard.space = false;
    window.gameControls.keyboard.shift = false;
    
    // Atualizar placar na UI
    import('../core/gameState.js').then(module => {
        module.atualizarPlacar();
    });
    
    // Verificar fim de jogo
    if (window.gameState.tempoRestante <= 0) {
        finalizarJogo();
    }
}

// Iniciar o loop de renderização
export function iniciarLoopDeJogo(scene) {
    DEBUG.log('game', 'Iniciando loop de renderização');
    
    // Loop de renderização
    function animate() {
        // Só continuar o loop se o jogo estiver rodando
        if (window.gameState.emAndamento) {
            requestAnimationFrame(animate);
        }
        
        // Capturar tempo delta para animações suaves
        const delta = window.threejs.clock.getDelta();
        
        // Atualizar controles da câmera se existirem
        if (window.threejs.orbitControls) {
            window.threejs.orbitControls.update();
        }
        
        // Atualizar lógica do jogo aqui
        atualizarJogo3D(scene, delta);
        
        // Verificar fim de jogo
        if (window.gameState.tempoRestante <= 0) {
            finalizarJogo();
        }
        
        // Renderizar a cena
        window.threejs.renderer.render(scene, window.threejs.camera);
    }
    
    // Iniciar o loop de animação
    animate();
}

export default { atualizarJogo3D, iniciarLoopDeJogo };