/**
 * Sistema de Inicialização do Jogo
 * Responsável por iniciar o jogo, carregar recursos, e configurar o ambiente
 */

import DEBUG from '../core/debug.js';
import ResourceManager from '../core/resourceManager.js';
import { iniciarTemporizador } from '../core/gameState.js';
import { configurarControlesTeclado } from '../controls/keyboard.js';
import { criarCampoFutebol } from '../game/field.js';
import { criarJogadores } from '../game/players.js';
import { setCameraPosition } from '../ui/camera.js';
import { setupCameraMenu } from '../ui/camera.js';
import { iniciarLoopDeJogo } from './gameLoop.js';

// Função para iniciar o jogo (ponto de entrada principal)
export function iniciarJogo() {
    // Evitar inicialização múltipla
    if (window.gameState.initializing) {
        DEBUG.warn('game', 'Jogo já está sendo inicializado');
        return;
    }
    
    if (window.gameState.initialized) {
        DEBUG.log('game', 'Jogo já inicializado, apenas retomando');
        
        // Apenas mudar para a cena de jogo se estiver usando Phaser
        if (!window.gameState.modo3D && window.game && window.game.scene) {
            window.game.scene.start('GameScene');
        }
        
        // Mostrar tela de jogo
        document.getElementById('tela-jogo').classList.remove('escondido');
        document.getElementById('menu-principal').classList.add('escondido');
        
        // Ativar estado de jogo
        window.gameState.emAndamento = true;
        return;
    }
    
    // Marcar como em inicialização
    window.gameState.initializing = true;
    
    DEBUG.log('game', 'Iniciando jogo no modo: ' + (window.gameState.modo3D ? '3D' : '2D'));
    
    if (window.gameState.modo3D) {
        iniciar3DJogo();
    } else {
        DEBUG.error('game', 'Modo 2D não está implementado nesta versão.');
    }
}

// Função para iniciar o jogo em 3D com Three.js
export async function iniciar3DJogo() {
    DEBUG.log('game', 'Inicializando jogo 3D');
    
    try {
        // Verificar se a API THREE está disponível
        if (typeof THREE === 'undefined') {
            DEBUG.error('resources', 'THREE.js não está carregado!');
            
            // Tentar carregar dinamicamente
            const loadThreeJs = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
                script.onload = () => {
                    DEBUG.log('resources', 'THREE.js carregado dinamicamente com sucesso!');
                    resolve();
                };
                script.onerror = () => {
                    DEBUG.error('resources', 'Falha ao carregar THREE.js dinamicamente');
                    reject(new Error('Falha ao carregar THREE.js'));
                };
                document.head.appendChild(script);
            });
            
            await loadThreeJs;
        }
        
        // Obter o contêiner do jogo
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) {
            throw new Error('Contêiner do jogo não encontrado');
        }
        
        // Criar elemento canvas para Three.js se ainda não existir
        let canvas3D = document.getElementById('three-canvas');
        if (!canvas3D) {
            DEBUG.log('rendering', 'Criando canvas para THREE.js');
            canvas3D = document.createElement('canvas');
            canvas3D.id = 'three-canvas';
            canvas3D.style.width = '100%';
            canvas3D.style.height = '100%';
            gameContainer.appendChild(canvas3D);
        }
        
        // Inicializar Three.js
        DEBUG.log('rendering', 'Inicializando cena THREE.js');
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb); // Cor de céu azul
        
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            canvas: canvas3D, 
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Armazenar referências para uso posterior
        window.threejs = {
            scene,
            camera,
            renderer,
            clock: new THREE.Clock()
        };
        
        // Adicionar câmera orbital para testes
        let controlesCamara = null;
        if (THREE.OrbitControls) {
            DEBUG.log('rendering', 'Inicializando controles de câmera orbital');
            controlesCamara = new THREE.OrbitControls(camera, renderer.domElement);
            controlesCamara.enableDamping = true;
            controlesCamara.dampingFactor = 0.25;
            controlesCamara.screenSpacePanning = false;
            controlesCamara.maxPolarAngle = Math.PI / 2;
            window.threejs.orbitControls = controlesCamara;
        }
        
        // Configurar câmera para visão estilo FIFA Street
        camera.position.set(0, 10, 15); // Posicionar a câmera em ângulo diagonal
        camera.lookAt(0, 0, 0);
        
        // Inicializar componentes do jogo
        DEBUG.log('game', 'Criando campo de futebol');
        criarCampoFutebol(scene);
        
        DEBUG.log('game', 'Criando jogadores');
        criarJogadores(scene);
        
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        // Luz direcional (como sol)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        
        // Ajustar área de sombra
        directionalLight.shadow.camera.left = -15;
        directionalLight.shadow.camera.right = 15;
        directionalLight.shadow.camera.top = 15;
        directionalLight.shadow.camera.bottom = -15;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 30;
        
        scene.add(directionalLight);
        
        // Aguardar carregamento de recursos
        await ResourceManager.waitForAllResources();
        
        // Configurar redimensionamento
        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        });
        
        // Configurar controles de teclado para desktop
        configurarControlesTeclado();
        
        // Configurar temporizador
        iniciarTemporizador();
        
        // Configurar menu de câmeras
        setupCameraMenu();
        
        // Definir posição inicial da câmera baseado na preferência salva
        if (window.gameState.cameraMode) {
            setCameraPosition(window.gameState.cameraMode);
        } else {
            // Usar modo médio por padrão
            window.gameState.cameraMode = 'media';
            setCameraPosition('media');
        }
        
        // Iniciar loop de animação
        iniciarLoopDeJogo(scene);
        
        // Mostrar a tela de jogo
        document.getElementById('tela-jogo').classList.remove('escondido');
        document.getElementById('menu-principal').classList.add('escondido');
        
        // Inicializar controles e estado do jogo
        window.gameState.emAndamento = true;
        window.gameState.tempoRestante = 60;
        window.gameState.placar = { jogador: 0, cpu: 0 };
        window.gameState.initializing = false;
        window.gameState.initialized = true;
        
        DEBUG.log('game', 'Jogo 3D inicializado com sucesso!');
    } catch (error) {
        DEBUG.error('game', 'Erro ao inicializar jogo 3D:', error);
        window.gameState.initializing = false;
        
        // Notificar usuário com uma mensagem visual
        const errorMsg = document.createElement('div');
        errorMsg.style.position = 'absolute';
        errorMsg.style.top = '10px';
        errorMsg.style.left = '10px';
        errorMsg.style.background = 'rgba(255,0,0,0.8)';
        errorMsg.style.color = 'white';
        errorMsg.style.padding = '10px';
        errorMsg.style.borderRadius = '5px';
        errorMsg.style.zIndex = 1000;
        errorMsg.textContent = `Erro ao inicializar jogo: ${error.message}`;
        document.body.appendChild(errorMsg);
        
        setTimeout(() => {
            document.body.removeChild(errorMsg);
        }, 5000);
    }
}

export default { iniciarJogo, iniciar3DJogo }; 