/**
 * Ponto de entrada principal do jogo Fute Street 3D
 * Este arquivo carrega e inicializa todos os sistemas necessários
 */

// Importar módulos principais
import DEBUG from './core/debug.js';
import { initGameState } from './core/gameState.js';
import { inicializarAudio } from './game/audio.js';
import { configurarControlesMobile } from './controls/mobile.js';
import { configurarBotoesUI } from './ui/interface.js';
import { iniciarJogo } from './game/initialization.js';

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    DEBUG.log('init', '=== INICIALIZAÇÃO DO JOGO FUTE STREET 3D ===');
    
    try {
        // Inicializar estado do jogo
        initGameState();
        
        // Inicializar componentes do jogo
        DEBUG.log('init', 'Inicializando componentes do jogo');
        inicializarAudio();
        configurarControlesMobile();
        configurarBotoesUI();
        
        // Verificar se THREE.js está disponível
        if (typeof THREE === 'undefined') {
            DEBUG.log('init', 'THREE.js não detectado, será carregado dinamicamente');
            
            // Carregar THREE.js dinamicamente se não estiver disponível
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = () => {
                DEBUG.log('resources', "Three.js carregado com sucesso!");
                iniciarJogo();
            };
            script.onerror = (error) => {
                DEBUG.error('resources', "Erro ao carregar Three.js:", error);
                
                // Exibir mensagem de erro na interface
                const errorMsg = document.createElement('div');
                errorMsg.style.position = 'absolute';
                errorMsg.style.top = '50%';
                errorMsg.style.left = '50%';
                errorMsg.style.transform = 'translate(-50%, -50%)';
                errorMsg.style.background = 'rgba(255,0,0,0.8)';
                errorMsg.style.color = 'white';
                errorMsg.style.padding = '20px';
                errorMsg.style.borderRadius = '10px';
                errorMsg.textContent = 'Erro ao carregar THREE.js. Verifique sua conexão e recarregue a página.';
                document.body.appendChild(errorMsg);
            };
            document.head.appendChild(script);
        } else {
            DEBUG.log('init', 'THREE.js já está carregado, iniciando jogo diretamente');
            iniciarJogo();
        }
        
        // Atualizar texto do botão jogar para "JOGAR"
        const btnJogar = document.getElementById('btn-jogar');
        if (btnJogar) {
            btnJogar.disabled = false;
            btnJogar.textContent = 'JOGAR';
        }
        
        DEBUG.log('init', 'Inicialização concluída com sucesso!');
    } catch (error) {
        DEBUG.error('init', 'Erro durante a inicialização:', error);
        
        // Exibir mensagem de erro visível para o usuário
        const errorMsg = document.createElement('div');
        errorMsg.style.position = 'absolute';
        errorMsg.style.top = '50%';
        errorMsg.style.left = '50%';
        errorMsg.style.transform = 'translate(-50%, -50%)';
        errorMsg.style.background = 'rgba(255,0,0,0.8)';
        errorMsg.style.color = 'white';
        errorMsg.style.padding = '20px';
        errorMsg.style.borderRadius = '10px';
        errorMsg.textContent = `Erro durante a inicialização: ${error.message}`;
        document.body.appendChild(errorMsg);
    }
}); 