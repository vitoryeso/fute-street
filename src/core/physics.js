/**
 * Sistema de Física do Jogo
 * Responsável pela física da bola, colisões e movimentos dos jogadores
 */

import DEBUG from './debug.js';
import { criarEfeitoChute } from '../ui/effects.js';

// Sistema de Física
const Physics = {
    // Configurações da física
    ballRadius: 0.3,
    playerRadius: 0.4,
    friction: 0.98,
    restitution: 0.7,
    gravity: 0.005,
    
    // Sistema de colisões
    checkBallWallCollision: function(ball, walls) {
        if (!ball || !walls) return false;
        
        let collided = false;
        
        const ballPosition = ball.position.clone();
        const ballVelocity = window.threejs.ballPhysics.velocity;
        
        // Verificar colisão com cada parede
        walls.forEach(wall => {
            // Obter dimensões e posição da parede
            const wallBox = new THREE.Box3().setFromObject(wall);
            
            // Criar esfera da bola
            const ballSphere = new THREE.Sphere(ballPosition, this.ballRadius);
            
            // Verificar colisão entre esfera e caixa
            if (wallBox.intersectsSphere(ballSphere)) {
                DEBUG.log('collisions', 'Colisão de bola com parede!', wall.position);
                
                // Determinar em qual direção ocorreu a colisão
                // Calcular vetor normal da colisão
                const wallCenter = new THREE.Vector3();
                wallBox.getCenter(wallCenter);
                
                // Obter as dimensões da caixa
                const wallSize = new THREE.Vector3();
                wallBox.getSize(wallSize);
                
                // Determinar qual face da caixa foi atingida
                const dx = Math.abs(ballPosition.x - wallCenter.x);
                const dy = Math.abs(ballPosition.y - wallCenter.y);
                const dz = Math.abs(ballPosition.z - wallCenter.z);
                
                // Calcular as distâncias até cada face
                const distToXFace = wallSize.x / 2;
                const distToYFace = wallSize.y / 2;
                const distToZFace = wallSize.z / 2;
                
                // Verificar qual face foi atingida
                if (dx / distToXFace > dz / distToZFace && dx / distToXFace > dy / distToYFace) {
                    // Colisão na face X
                    ballVelocity.x = -ballVelocity.x * this.restitution;
                    // Ajustar posição para evitar ultrapassar a parede
                    const signX = Math.sign(ballPosition.x - wallCenter.x);
                    ball.position.x = wallCenter.x + (signX * (distToXFace + this.ballRadius));
                }
                else if (dz / distToZFace > dx / distToXFace && dz / distToZFace > dy / distToYFace) {
                    // Colisão na face Z
                    ballVelocity.z = -ballVelocity.z * this.restitution;
                    // Ajustar posição para evitar ultrapassar a parede
                    const signZ = Math.sign(ballPosition.z - wallCenter.z);
                    ball.position.z = wallCenter.z + (signZ * (distToZFace + this.ballRadius));
                }
                
                // Adicionar um pouco de amortecimento na direção perpendicular à colisão
                ballVelocity.multiplyScalar(this.friction);
                
                collided = true;
            }
        });
        
        return collided;
    },
    
    checkBallPlayerCollision: function(ball, player) {
        if (!ball || !player) return false;
        
        const ballPosition = ball.position.clone();
        const playerPosition = player.position.clone();
        
        // Calcular distância entre os centros
        const distance = ballPosition.distanceTo(playerPosition);
        
        // Verificar se há colisão
        if (distance < (this.ballRadius + this.playerRadius)) {
            DEBUG.log('collisions', 'Colisão de bola com jogador!', playerPosition);
            
            // Calcular direção da colisão (do jogador para a bola)
            const direction = new THREE.Vector3()
                .subVectors(ballPosition, playerPosition)
                .normalize();
                
            // Obter a velocidade do jogador (se estiver se movendo)
            const playerSpeed = 0.15; // valor fixo por enquanto
            const playerMoving = (
                Math.abs(window.gameControls.joystick.x) > 0.1 || 
                Math.abs(window.gameControls.joystick.y) > 0.1
            );
            
            if (playerMoving) {
                // Transferir momentum do jogador para a bola
                window.threejs.ballPhysics.velocity.x += direction.x * playerSpeed;
                window.threejs.ballPhysics.velocity.z += direction.z * playerSpeed;
            } else {
                // Apenas rebater a bola se o jogador estiver parado
                window.threejs.ballPhysics.velocity.reflect(direction);
                window.threejs.ballPhysics.velocity.multiplyScalar(this.friction);
            }
            
            // Verificar se o jogador chutou ou passou a bola
            if (window.gameControls.buttons.chute) {
                // Força extra na direção do movimento do jogador
                const forceMultiplier = 0.3;
                window.threejs.ballPhysics.velocity.x += window.gameControls.joystick.x * forceMultiplier;
                window.threejs.ballPhysics.velocity.z += window.gameControls.joystick.y * forceMultiplier;
                
                // Criar efeito visual
                criarEfeitoChute(ball.position);
                
                DEBUG.log('physics', 'Chute forte aplicado!', window.threejs.ballPhysics.velocity);
            } 
            else if (window.gameControls.buttons.passe) {
                // Passe mais suave
                const forceMultiplier = 0.15;
                window.threejs.ballPhysics.velocity.x += window.gameControls.joystick.x * forceMultiplier;
                window.threejs.ballPhysics.velocity.z += window.gameControls.joystick.y * forceMultiplier;
                
                DEBUG.log('physics', 'Passe aplicado!', window.threejs.ballPhysics.velocity);
            }
            
            // Afastar a bola do jogador para evitar colisões múltiplas
            ball.position.add(
                direction.multiplyScalar(this.ballRadius + this.playerRadius - distance + 0.01)
            );
            
            return true;
        }
        
        return false;
    },
    
    updateBallPhysics: function(ball) {
        if (!ball || !window.threejs.ballPhysics) return;
        
        const ballPhysics = window.threejs.ballPhysics;
        
        // Aplicar velocidade
        ball.position.x += ballPhysics.velocity.x;
        ball.position.z += ballPhysics.velocity.z;
        
        // Aplicar gravidade para a bola quicar (simulação simplificada)
        ball.position.y += ballPhysics.velocity.y;
        ballPhysics.velocity.y -= this.gravity;
        
        // Se a bola tocar o chão, quicar
        if (ball.position.y < this.ballRadius) {
            ball.position.y = this.ballRadius;
            ballPhysics.velocity.y = Math.abs(ballPhysics.velocity.y) * this.restitution * 0.8;
            
            // Se a velocidade vertical for muito pequena, parar o quicar
            if (ballPhysics.velocity.y < 0.01) {
                ballPhysics.velocity.y = 0;
            }
        }
        
        // Rotacionar a bola baseado na velocidade
        ball.rotation.x += ballPhysics.velocity.z * 5;
        ball.rotation.z -= ballPhysics.velocity.x * 5;
        
        // Aplicar fricção
        ballPhysics.velocity.x *= this.friction;
        ballPhysics.velocity.z *= this.friction;
        
        // Limitar velocidade máxima
        const horizSpeed = Math.sqrt(
            ballPhysics.velocity.x * ballPhysics.velocity.x + 
            ballPhysics.velocity.z * ballPhysics.velocity.z
        );
        
        if (horizSpeed > ballPhysics.maxSpeed) {
            const reduction = ballPhysics.maxSpeed / horizSpeed;
            ballPhysics.velocity.x *= reduction;
            ballPhysics.velocity.z *= reduction;
        }
        
        // Log de debug apenas se a bola estiver se movendo significativamente
        if (horizSpeed > 0.01) {
            DEBUG.log('physics', 'Velocidade da bola:', 
                {x: ballPhysics.velocity.x.toFixed(3), 
                 y: ballPhysics.velocity.y.toFixed(3), 
                 z: ballPhysics.velocity.z.toFixed(3)});
        }
    }
};

/**
 * Calcula a distância entre dois pontos 3D
 */
export function calcularDistancia(ponto1, ponto2) {
    return Math.sqrt(
        Math.pow(ponto1.x - ponto2.x, 2) +
        Math.pow(ponto1.z - ponto2.z, 2)
    );
}

export default Physics; 