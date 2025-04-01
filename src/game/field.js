/**
 * Sistema de Criação do Campo
 * Responsável por criar o campo de futebol, gols e paredes
 */

import DEBUG from '../core/debug.js';

// Função para criar o campo de futebol em 3D
export function criarCampoFutebol(scene) {
    DEBUG.log('rendering', 'Criando campo de futebol');
    
    try {
        // Criar superfície do campo (plano verde)
        const fieldGeometry = new THREE.PlaneGeometry(20, 30);
        
        // Carregar textura do campo com fallback
        const fieldTexture = new THREE.TextureLoader().load(
            // Usar uma textura local como alternativa à URL externa
            './assets/textures/field.jpg',
            // Callback de sucesso
            (texture) => {
                DEBUG.log('resources', 'Textura do campo carregada com sucesso');
                // Configurar repetição da textura
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                texture.needsUpdate = true;
                // Aplicar a textura ao material do campo
                fieldMaterial.map = texture;
                fieldMaterial.needsUpdate = true;
            },
            // Callback de progresso
            undefined,
            // Callback de erro
            (err) => {
                DEBUG.error('resources', 'Erro ao carregar textura do campo:', err);
                // Tentar carregar de URL externa como fallback
                const fallbackTexture = new THREE.TextureLoader().load(
                    'https://thumbs.dreamstime.com/b/green-grass-soccer-field-background-aerial-view-football-pitch-green-grass-soccer-field-background-149939647.jpg',
                    (texture) => {
                        DEBUG.log('resources', 'Textura fallback do campo carregada');
                        fieldMaterial.map = texture;
                        fieldMaterial.needsUpdate = true;
                    },
                    undefined,
                    (err) => {
                        DEBUG.error('resources', 'Erro também no fallback, usando cor sólida:', err);
                    }
                );
            }
        );
        
        // Criar material com cor de fallback enquanto a textura carrega
        const fieldMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2e8b57,
            side: THREE.DoubleSide
        });
        
        const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        field.rotation.x = -Math.PI / 2; // Rotacionar para ficar na horizontal
        field.receiveShadow = true;
        scene.add(field);
        
        DEBUG.log('rendering', 'Campo de futebol base criado');
        
        // Adicionar textura de solo ao redor do campo
        const groundGeometry = new THREE.PlaneGeometry(40, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513, 
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.01;
        ground.receiveShadow = true;
        scene.add(ground);
        
        // Linhas do campo
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        
        // Contorno do campo
        const borderPoints = [
            new THREE.Vector3(-9, 0, -14),
            new THREE.Vector3(9, 0, -14),
            new THREE.Vector3(9, 0, 14),
            new THREE.Vector3(-9, 0, 14),
            new THREE.Vector3(-9, 0, -14)
        ];
        const borderGeometry = new THREE.BufferGeometry().setFromPoints(borderPoints);
        const borderLine = new THREE.Line(borderGeometry, lineMaterial);
        borderLine.position.y = 0.01; // Ligeiramente acima do campo
        scene.add(borderLine);
        
        // Linha do meio-campo
        const midlinePoints = [
            new THREE.Vector3(-9, 0, 0),
            new THREE.Vector3(9, 0, 0)
        ];
        const midlineGeometry = new THREE.BufferGeometry().setFromPoints(midlinePoints);
        const midLine = new THREE.Line(midlineGeometry, lineMaterial);
        midLine.position.y = 0.01;
        scene.add(midLine);
        
        // Círculo central
        const circleGeometry = new THREE.CircleGeometry(3, 32);
        circleGeometry.rotateX(-Math.PI / 2);
        const circleMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const circle = new THREE.LineSegments(
            new THREE.EdgesGeometry(circleGeometry),
            circleMaterial
        );
        circle.position.y = 0.01;
        scene.add(circle);
        
        // Áreas de gol (pequena e grande área)
        // Área superior
        criarAreaGol(-14, scene);
        // Área inferior
        criarAreaGol(14, scene);
        
        // Adicionar balizas 3D em vez de simples caixas
        // Gol superior
        criarBaliza(-14.1, scene);
        
        // Gol inferior
        criarBaliza(14.1, scene);
        
        // Adicionar paredes invisíveis ao redor do campo
        const wallGeometry = new THREE.BoxGeometry(0.5, 2, 30);
        const wallMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000, 
            transparent: true,
            opacity: DEBUG.collisions ? 0.2 : 0 // Visível apenas no modo debug
        });
        
        // Parede esquerda
        const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
        leftWall.position.set(-9.25, 1, 0);
        leftWall.name = "wall-left";
        scene.add(leftWall);
        
        // Parede direita
        const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
        rightWall.position.set(9.25, 1, 0);
        rightWall.name = "wall-right";
        scene.add(rightWall);
        
        // Paredes de fundo (atrás dos gols)
        const backWallGeometry = new THREE.BoxGeometry(20, 2, 0.5);
        
        // Parede fundo superior
        const topWall = new THREE.Mesh(backWallGeometry, wallMaterial);
        topWall.position.set(0, 1, -14.25);
        topWall.name = "wall-top";
        scene.add(topWall);
        
        // Parede fundo inferior
        const bottomWall = new THREE.Mesh(backWallGeometry, wallMaterial);
        bottomWall.position.set(0, 1, 14.25);
        bottomWall.name = "wall-bottom";
        scene.add(bottomWall);
        
        // Adicionar essas paredes ao objeto threejs para detecção de colisão
        window.threejs = window.threejs || {};
        window.threejs.paredes = [leftWall, rightWall, topWall, bottomWall];
        
        DEBUG.log('rendering', 'Campo de futebol completo criado com sucesso');
        return true;
    } catch (error) {
        DEBUG.error('rendering', 'Erro ao criar campo de futebol:', error);
        return false;
    }
}

// Função para criar áreas de gol
export function criarAreaGol(posZ, scene) {
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const isTop = posZ < 0;
    const yPos = 0.01; // Ligeiramente acima do campo
    
    // Grande área
    const bigAreaPoints = [
        new THREE.Vector3(-5.5, yPos, posZ),
        new THREE.Vector3(5.5, yPos, posZ),
        new THREE.Vector3(5.5, yPos, posZ + (isTop ? 4 : -4)),
        new THREE.Vector3(-5.5, yPos, posZ + (isTop ? 4 : -4)),
        new THREE.Vector3(-5.5, yPos, posZ)
    ];
    
    const bigAreaGeometry = new THREE.BufferGeometry().setFromPoints(bigAreaPoints);
    const bigArea = new THREE.Line(bigAreaGeometry, lineMaterial);
    scene.add(bigArea);
    
    // Pequena área
    const smallAreaPoints = [
        new THREE.Vector3(-2.5, yPos, posZ),
        new THREE.Vector3(2.5, yPos, posZ),
        new THREE.Vector3(2.5, yPos, posZ + (isTop ? 2 : -2)),
        new THREE.Vector3(-2.5, yPos, posZ + (isTop ? 2 : -2)),
        new THREE.Vector3(-2.5, yPos, posZ)
    ];
    
    const smallAreaGeometry = new THREE.BufferGeometry().setFromPoints(smallAreaPoints);
    const smallArea = new THREE.Line(smallAreaGeometry, lineMaterial);
    scene.add(smallArea);
    
    // Marca do pênalti
    const penaltyDotGeometry = new THREE.CircleGeometry(0.1, 8);
    penaltyDotGeometry.rotateX(-Math.PI / 2);
    const penaltyDotMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const penaltyDot = new THREE.Mesh(penaltyDotGeometry, penaltyDotMaterial);
    penaltyDot.position.set(0, 0.02, posZ + (isTop ? 3 : -3));
    scene.add(penaltyDot);
}

// Função para criar balizas 3D
export function criarBaliza(posZ, scene) {
    DEBUG.log('rendering', `Criando baliza na posição Z: ${posZ}`);
    
    try {
        const goalMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        
        // Estrutura completa da baliza como grupo
        const goalGroup = new THREE.Group();
        goalGroup.position.set(0, 0, posZ);
        goalGroup.name = posZ < 0 ? "goal-top" : "goal-bottom";
        
        // Poste esquerdo
        const leftPostGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
        const leftPost = new THREE.Mesh(leftPostGeometry, goalMaterial);
        leftPost.position.set(-2, 1, 0);
        leftPost.castShadow = true;
        goalGroup.add(leftPost);
        
        // Poste direito
        const rightPostGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
        const rightPost = new THREE.Mesh(rightPostGeometry, goalMaterial);
        rightPost.position.set(2, 1, 0);
        rightPost.castShadow = true;
        goalGroup.add(rightPost);
        
        // Travessão
        const crossbarGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
        const crossbar = new THREE.Mesh(crossbarGeometry, goalMaterial);
        crossbar.rotation.z = Math.PI / 2;
        crossbar.position.set(0, 2, 0);
        crossbar.castShadow = true;
        goalGroup.add(crossbar);
        
        // Rede (simplificada)
        const redeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        
        // Parte de trás da rede
        const redeTraseiraGeometry = new THREE.PlaneGeometry(4, 2);
        const redeTraseira = new THREE.Mesh(redeTraseiraGeometry, redeMaterial);
        redeTraseira.position.set(0, 1, posZ > 0 ? 0.5 : -0.5);
        goalGroup.add(redeTraseira);
        
        // Partes laterais (simplificadas)
        const redeLateralGeometry = new THREE.PlaneGeometry(1, 2);
        
        const redeEsquerda = new THREE.Mesh(redeLateralGeometry, redeMaterial);
        redeEsquerda.rotation.y = Math.PI / 2;
        redeEsquerda.position.set(-2, 1, posZ > 0 ? 0.25 : -0.25);
        goalGroup.add(redeEsquerda);
        
        const redeDireita = new THREE.Mesh(redeLateralGeometry, redeMaterial);
        redeDireita.rotation.y = Math.PI / 2;
        redeDireita.position.set(2, 1, posZ > 0 ? 0.25 : -0.25);
        goalGroup.add(redeDireita);
        
        // Parte superior
        const redeSuperiorGeometry = new THREE.PlaneGeometry(4, 1);
        const redeSuperior = new THREE.Mesh(redeSuperiorGeometry, redeMaterial);
        redeSuperior.rotation.x = Math.PI / 2;
        redeSuperior.position.set(0, 2, posZ > 0 ? 0.25 : -0.25);
        goalGroup.add(redeSuperior);
        
        // Adicionar colisores específicos para detecção de gols
        // Este objeto será usado para verificar quando a bola cruzar a linha
        const goalDetectorGeometry = new THREE.BoxGeometry(4, 2, 0.1);
        const goalDetectorMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: DEBUG.collisions ? 0.3 : 0
        });
        
        const goalDetector = new THREE.Mesh(goalDetectorGeometry, goalDetectorMaterial);
        goalDetector.position.set(0, 1, 0);
        goalDetector.name = posZ < 0 ? "goal-line-top" : "goal-line-bottom";
        goalGroup.add(goalDetector);
        
        // Adicionar o grupo completo à cena
        scene.add(goalGroup);
        
        // Adicionar detector de gols à lista de zonas de gol se ainda não existir
        window.threejs.goalZones = window.threejs.goalZones || [];
        window.threejs.goalZones.push(goalDetector);
        
        DEBUG.log('rendering', `Baliza criada com sucesso em Z=${posZ}`);
        return goalGroup;
    } catch (error) {
        DEBUG.error('rendering', `Erro ao criar baliza em Z=${posZ}:`, error);
        return null;
    }
}

export default { criarCampoFutebol, criarAreaGol, criarBaliza }; 