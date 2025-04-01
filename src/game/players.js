/**
 * Sistema de Criação e Gerenciamento de Jogadores
 * Responsável por criar jogadores, bola e gerenciar suas posições
 */

import DEBUG from '../core/debug.js';

// Função para criar jogadores em 3D
export function criarJogadores(scene) {
    DEBUG.log('rendering', 'Criando jogadores');
    
    try {
        // Time do jogador (azul)
        const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        
        // Jogador principal (modelo mais complexo)
        const playerGroup = new THREE.Group();
        playerGroup.name = "main-player";
        
        // Corpo do jogador
        const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16);
        const body = new THREE.Mesh(bodyGeometry, playerMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        playerGroup.add(body);
        
        // Cabeça
        const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdead });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        head.castShadow = true;
        playerGroup.add(head);
        
        // Adicionar texto para identificar o jogador principal
        const loader = new THREE.TextureLoader();
        const playerNumber = document.createElement('canvas');
        playerNumber.width = 64;
        playerNumber.height = 64;
        const ctx = playerNumber.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = 'blue';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('10', 32, 32);
        
        const numberTexture = new THREE.CanvasTexture(playerNumber);
        const numberMaterial = new THREE.MeshBasicMaterial({
            map: numberTexture,
            side: THREE.DoubleSide,
            transparent: true
        });
        
        const numberPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(0.3, 0.3),
            numberMaterial
        );
        numberPlane.position.set(0, 0.6, -0.41);
        numberPlane.rotation.x = Math.PI / 2;
        playerGroup.add(numberPlane);
        
        // Adicionar uma colisão de jogador
        const playerCollider = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.4, 1.5, 8),
            new THREE.MeshBasicMaterial({
                color: 0x0000ff,
                transparent: true,
                opacity: DEBUG.collisions ? 0.3 : 0
            })
        );
        playerCollider.position.y = 0.75;
        playerGroup.add(playerCollider);
        
        // Posição inicial
        playerGroup.position.set(0, 0, 5);
        scene.add(playerGroup);
        
        // Outros jogadores do time azul
        const blueTeamPositions = [
            [-3, 0, 3], [3, 0, 3],
            [-5, 0, 6], [5, 0, 6],
            [0, 0, 10]
        ];
        
        const blueTeammates = [];
        blueTeamPositions.forEach((pos, index) => {
            const teammate = criarJogadorSimplificado(0x0000ff, 0xffdead);
            teammate.position.set(pos[0], pos[1], pos[2]);
            teammate.name = `blue-player-${index}`;
            scene.add(teammate);
            blueTeammates.push(teammate);
        });
        
        // Time adversário (vermelho)
        const opponentMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        
        const opponentTeamPositions = [
            [0, 0, -5],
            [-3, 0, -3], [3, 0, -3],
            [-5, 0, -6], [5, 0, -6],
            [0, 0, -10]
        ];
        
        const redTeam = [];
        opponentTeamPositions.forEach((pos, index) => {
            const opponent = criarJogadorSimplificado(0xff0000, 0xffdead);
            opponent.position.set(pos[0], pos[1], pos[2]);
            opponent.name = `red-player-${index}`;
            scene.add(opponent);
            redTeam.push(opponent);
        });
        
        // Bola
        const ballGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        // Tentar carregar textura de bola
        const ballTexture = new THREE.TextureLoader().load(
            './assets/textures/ball.jpg',
            (texture) => {
                DEBUG.log('resources', 'Textura da bola carregada com sucesso');
                ballMaterial.map = texture;
                ballMaterial.needsUpdate = true;
            },
            undefined,
            (err) => {
                DEBUG.error('resources', 'Erro ao carregar textura da bola:', err);
                // Tentar fallback
                const fallbackTexture = new THREE.TextureLoader().load(
                    'https://i.imgur.com/pDWGT4E.jpg',
                    (texture) => {
                        DEBUG.log('resources', 'Textura fallback da bola carregada');
                        ballMaterial.map = texture;
                        ballMaterial.needsUpdate = true;
                    }
                );
            }
        );
        
        const ballMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            bumpScale: 0.01
        });
        
        const ball = new THREE.Mesh(ballGeometry, ballMaterial);
        ball.position.set(0, 0.3, 0);
        ball.castShadow = true;
        ball.name = "ball";
        scene.add(ball);
        
        // Guardar referência à bola e jogadores para atualizações
        window.threejs = window.threejs || {};
        window.threejs.ball = ball;
        window.threejs.mainPlayer = playerGroup;
        window.threejs.blueTeam = blueTeammates;
        window.threejs.redTeam = redTeam;
        
        // Adicionar física para a bola
        window.threejs.ballPhysics = {
            velocity: new THREE.Vector3(0, 0, 0),
            maxSpeed: 0.5,
            friction: 0.98
        };
        
        DEBUG.log('rendering', 'Jogadores e bola criados com sucesso');
        return true;
    } catch (error) {
        DEBUG.error('rendering', 'Erro ao criar jogadores:', error);
        return false;
    }
}

// Função para criar jogador simplificado
export function criarJogadorSimplificado(corCamisa, corPele) {
    const playerGroup = new THREE.Group();
    
    // Corpo
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: corCamisa });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.4;
    body.castShadow = true;
    playerGroup.add(body);
    
    // Cabeça
    const headGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: corPele });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1;
    head.castShadow = true;
    playerGroup.add(head);
    
    // Adicionar colisão
    const playerCollider = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8),
        new THREE.MeshBasicMaterial({
            color: corCamisa,
            transparent: true,
            opacity: DEBUG.collisions ? 0.3 : 0
        })
    );
    playerCollider.position.y = 0.6;
    playerGroup.add(playerCollider);
    
    return playerGroup;
}

// Função para resetar a bola após um gol
export function resetarBola() {
    DEBUG.log('game', 'Resetando posição da bola e jogadores');
    
    if (window.threejs && window.threejs.ball) {
        // Reposicionar a bola no centro
        window.threejs.ball.position.set(0, 0.3, 0);
        
        // Resetar velocidade
        if (window.threejs.ballPhysics) {
            window.threejs.ballPhysics.velocity.x = 0;
            window.threejs.ballPhysics.velocity.y = 0;
            window.threejs.ballPhysics.velocity.z = 0;
        }
        
        // Reposicionar jogadores
        reposicionarJogadores();
    }
}

// Função para reposicionar jogadores após um gol
export function reposicionarJogadores() {
    // Reposicionar jogador principal
    if (window.threejs.mainPlayer) {
        window.threejs.mainPlayer.position.set(0, 0, 5);
    }
    
    // Reposicionar time azul
    if (window.threejs.blueTeam) {
        const blueTeamPositions = [
            [-3, 0, 3], [3, 0, 3],
            [-5, 0, 6], [5, 0, 6],
            [0, 0, 10]
        ];
        
        window.threejs.blueTeam.forEach((jogador, index) => {
            const pos = blueTeamPositions[index];
            jogador.position.set(pos[0], pos[1], pos[2]);
        });
    }
    
    // Reposicionar time vermelho
    if (window.threejs.redTeam) {
        const redTeamPositions = [
            [0, 0, -5],
            [-3, 0, -3], [3, 0, -3],
            [-5, 0, -6], [5, 0, -6],
            [0, 0, -10]
        ];
        
        window.threejs.redTeam.forEach((jogador, index) => {
            const pos = redTeamPositions[index];
            jogador.position.set(pos[0], pos[1], pos[2]);
        });
    }
}

export default { 
    criarJogadores, 
    criarJogadorSimplificado, 
    resetarBola, 
    reposicionarJogadores 
}; 