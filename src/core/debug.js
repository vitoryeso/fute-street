/**
 * Debug e sistema de logging para o jogo
 * Oferece funcionalidades para debug em diferentes categorias
 */

// Sistema de Logging e Debug
const DEBUG = {
    enabled: true,
    physics: true,
    controls: true,
    rendering: true,
    resources: true,
    collisions: true,
    
    log: function(category, message, ...args) {
        if (!this.enabled) return;
        
        // Verificar se a categoria está habilitada
        if (this[category] === undefined || this[category] === true) {
            console.log(`[${category.toUpperCase()}] ${message}`, ...args);
        }
    },
    
    error: function(category, message, ...args) {
        console.error(`[${category.toUpperCase()}] ${message}`, ...args);
    },
    
    warn: function(category, message, ...args) {
        console.warn(`[${category.toUpperCase()}] ${message}`, ...args);
    }
};

export default DEBUG; 