/**
 * Sistema de Efeitos Visuais
 * Responsável por criar efeitos visuais para ações do jogo
 */

import DEBUG from '../core/debug.js';

// Função para criar efeito visual de chute
export function criarEfeitoChute(posicao) {
    if (!window.threejs || !window.threejs.scene) {
        DEBUG.warn('fx', 'Não foi possível criar efeito de chute: cena não está disponível');
        return;
    }
    
    DEBUG.log('fx', 'Criando efeito visual de chute');
    
    // Criar partículas para o efeito
    const particulas = [];
    const numParticulas = 10;
    const particulaGeometria = new THREE.SphereGeometry(0.05, 8, 8);
    const particulaMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    for (let i = 0; i < numParticulas; i++) {
        const particula = new THREE.Mesh(particulaGeometria, particulaMaterial);
        particula.position.set(
            posicao.x + (Math.random() - 0.5) * 0.3,
            posicao.y + Math.random() * 0.3,
            posicao.z + (Math.random() - 0.5) * 0.3
        );
        particula.userData = {
            velocidade: new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                Math.random() * 0.1,
                (Math.random() - 0.5) * 0.1
            ),
            vida: 20  // frames de vida
        };
        
        window.threejs.scene.add(particula);
        particulas.push(particula);
    }
    
    // Animar partículas
    function animarParticulas() {
        particulas.forEach((particula, index) => {
            if (!particula.userData) return;
            
            particula.position.x += particula.userData.velocidade.x;
            particula.position.y += particula.userData.velocidade.y;
            particula.position.z += particula.userData.velocidade.z;
            
            // Diminuir vida
            particula.userData.vida--;
            if (particula.userData.vida <= 0) {
                window.threejs.scene.remove(particula);
                particulas.splice(index, 1);
            }
        });
        
        if (particulas.length > 0) {
            requestAnimationFrame(animarParticulas);
        }
    }
    
    animarParticulas();
}

// Função para criar efeito visual de gol
export function criarEfeitoGol(time) {
    DEBUG.log('fx', `Criando efeito visual de gol para o time: ${time}`);
    
    // Criar texto temporário na tela
    const textoDivGol = document.createElement('div');
    textoDivGol.style.position = 'absolute';
    textoDivGol.style.top = '50%';
    textoDivGol.style.left = '50%';
    textoDivGol.style.transform = 'translate(-50%, -50%)';
    textoDivGol.style.fontSize = '5rem';
    textoDivGol.style.fontWeight = 'bold';
    textoDivGol.style.color = time === 'jogador' ? '#00ff00' : '#ff0000';
    textoDivGol.style.textShadow = '2px 2px 4px #000000';
    textoDivGol.style.zIndex = '1000';
    textoDivGol.style.transition = 'all 1s ease-in-out';
    textoDivGol.style.opacity = '0';
    textoDivGol.innerText = 'GOOOOOL!';
    
    document.body.appendChild(textoDivGol);
    
    // Animar o texto
    setTimeout(() => {
        textoDivGol.style.opacity = '1';
        textoDivGol.style.fontSize = '8rem';
    }, 100);
    
    setTimeout(() => {
        textoDivGol.style.opacity = '0';
    }, 2000);
    
    setTimeout(() => {
        document.body.removeChild(textoDivGol);
    }, 3000);
}

export default { criarEfeitoChute, criarEfeitoGol }; 