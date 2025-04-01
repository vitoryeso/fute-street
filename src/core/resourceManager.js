/**
 * Sistema de Gerenciamento de Recursos
 * Responsável pelo carregamento e cacheamento de texturas e outros recursos
 */

import DEBUG from './debug.js';

// Sistema de Gerenciamento de Recursos
const ResourceManager = {
    textureCache: {},
    loadingPromises: [],
    
    loadTexture: function(url, fallbackColor = 0xffffff) {
        DEBUG.log('resources', `Carregando textura: ${url}`);
        
        // Verificar se a textura já está em cache
        if (this.textureCache[url]) {
            DEBUG.log('resources', `Textura encontrada em cache: ${url}`);
            return this.textureCache[url];
        }
        
        // Criar material de fallback para usar enquanto a textura carrega
        const fallbackMaterial = new THREE.MeshStandardMaterial({ color: fallbackColor });
        
        // Iniciar carregamento assíncrono
        const textureLoader = new THREE.TextureLoader();
        const loadPromise = new Promise((resolve, reject) => {
            textureLoader.load(
                url,
                (texture) => {
                    DEBUG.log('resources', `Textura carregada com sucesso: ${url}`);
                    this.textureCache[url] = texture;
                    resolve(texture);
                },
                undefined,
                (error) => {
                    DEBUG.error('resources', `Erro ao carregar textura ${url}:`, error);
                    reject(error);
                }
            );
        });
        
        this.loadingPromises.push(loadPromise);
        
        // Retornar material de fallback enquanto carrega
        return fallbackMaterial;
    },
    
    waitForAllResources: async function() {
        DEBUG.log('resources', `Aguardando carregamento de ${this.loadingPromises.length} recursos...`);
        try {
            await Promise.all(this.loadingPromises);
            DEBUG.log('resources', 'Todos os recursos carregados com sucesso!');
            return true;
        } catch (error) {
            DEBUG.error('resources', 'Erro ao carregar recursos:', error);
            return false;
        }
    }
};

export default ResourceManager; 