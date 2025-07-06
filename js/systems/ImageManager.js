// Sistema de Gerenciamento de Imagens
export class ImageManager {
    constructor() {
        this.images = new Map();
        this.loadingPromises = new Map();
        this.defaultImages = {
            background: null,
            pathTile: null,
            grassTile: null,
            stoneTile: null
        };
    }

    // Carregar uma imagem
    async loadImage(key, src) {
        // Se já está carregando, retorna a promise existente
        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key);
        }

        // Se já está carregada, retorna imediatamente
        if (this.images.has(key)) {
            return this.images.get(key);
        }

        // Criar nova promise de carregamento
        const loadPromise = new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.images.set(key, img);
                this.loadingPromises.delete(key);
                resolve(img);
            };
            
            img.onerror = () => {
                this.loadingPromises.delete(key);
                console.warn(`Falha ao carregar imagem: ${src}`);
                reject(new Error(`Falha ao carregar imagem: ${src}`));
            };
            
            img.src = src;
        });

        this.loadingPromises.set(key, loadPromise);
        return loadPromise;
    }

    // Carregar múltiplas imagens
    async loadImages(imageMap) {
        const promises = Object.entries(imageMap).map(([key, src]) => 
            this.loadImage(key, src).catch(err => {
                console.warn(`Falha ao carregar ${key}: ${err.message}`);
                return null;
            })
        );
        
        try {
            const results = await Promise.all(promises);
            const successCount = results.filter(r => r !== null).length;
            const totalCount = Object.keys(imageMap).length;
            

            
            // Considerar sucesso se pelo menos 80% das imagens carregaram
            return successCount >= totalCount * 0.8;
        } catch (error) {
            console.error('Erro ao carregar imagens:', error);
            return false;
        }
    }

    // Obter imagem carregada
    getImage(key) {
        return this.images.get(key);
    }

    // Verificar se imagem está carregada
    isImageLoaded(key) {
        return this.images.has(key);
    }

    // Criar imagem padrão (tiles procedurais)
    createDefaultTile(type, size = 40) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        switch(type) {
            case 'grass':
                // Textura de grama
                ctx.fillStyle = '#4a7c59';
                ctx.fillRect(0, 0, size, size);
                
                // Adicionar alguns detalhes
                ctx.fillStyle = '#5e8f6f';
                for (let i = 0; i < 8; i++) {
                    const x = Math.random() * size;
                    const y = Math.random() * size;
                    ctx.fillRect(x, y, 2, 2);
                }
                break;

            case 'path_horizontal':
                // Textura de caminho horizontal
                ctx.fillStyle = '#8b7355';
                ctx.fillRect(0, 0, size, size);
                
                // Bordas horizontais mais escuras
                ctx.fillStyle = '#6b5635';
                ctx.fillRect(0, 0, size, 3);
                ctx.fillRect(0, size-3, size, 3);
                
                // Adicionar algumas pedras pequenas
                ctx.fillStyle = '#7a654a';
                for (let i = 0; i < 5; i++) {
                    const x = Math.random() * (size - 4);
                    const y = Math.random() * (size - 4);
                    ctx.fillRect(x, y, 3, 3);
                }
                break;

            case 'path_vertical':
                // Textura de caminho vertical
                ctx.fillStyle = '#8b7355';
                ctx.fillRect(0, 0, size, size);
                
                // Bordas verticais mais escuras
                ctx.fillStyle = '#6b5635';
                ctx.fillRect(0, 0, 3, size);
                ctx.fillRect(size-3, 0, 3, size);
                
                // Adicionar algumas pedras pequenas
                ctx.fillStyle = '#7a654a';
                for (let i = 0; i < 5; i++) {
                    const x = Math.random() * (size - 4);
                    const y = Math.random() * (size - 4);
                    ctx.fillRect(x, y, 3, 3);
                }
                break;

            case 'path_corner_tl':
                // Curva superior esquerda (conecta esquerda -> baixo ou cima -> direita)
                ctx.fillStyle = '#8b7355';
                ctx.fillRect(0, 0, size, size);
                
                // Desenhar caminho em L invertido
                ctx.fillStyle = '#7a654a';
                ctx.fillRect(0, size/2 - 8, size/2 + 8, 16);  // Horizontal
                ctx.fillRect(size/2 - 8, size/2 - 8, 16, size/2 + 8);  // Vertical
                
                // Bordas da curva
                ctx.strokeStyle = '#6b5635';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, size/2 - 8);
                ctx.lineTo(size/2 - 8, size/2 - 8);
                ctx.lineTo(size/2 - 8, size);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(0, size/2 + 8);
                ctx.lineTo(size/2 + 8, size/2 + 8);
                ctx.lineTo(size/2 + 8, size);
                ctx.stroke();
                
                // Pedras pequenas
                ctx.fillStyle = '#6b5635';
                for (let i = 0; i < 3; i++) {
                    const x = Math.random() * (size - 8) + 4;
                    const y = Math.random() * (size - 8) + 4;
                    ctx.fillRect(x, y, 2, 2);
                }
                break;

            case 'path_corner_tr':
                // Curva superior direita (conecta direita -> baixo ou cima -> esquerda)
                ctx.fillStyle = '#8b7355';
                ctx.fillRect(0, 0, size, size);
                
                // Desenhar caminho em L
                ctx.fillStyle = '#7a654a';
                ctx.fillRect(size/2 - 8, size/2 - 8, size/2 + 8, 16);  // Horizontal
                ctx.fillRect(size/2 - 8, size/2 - 8, 16, size/2 + 8);  // Vertical
                
                // Bordas da curva
                ctx.strokeStyle = '#6b5635';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(size, size/2 - 8);
                ctx.lineTo(size/2 + 8, size/2 - 8);
                ctx.lineTo(size/2 + 8, size);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(size, size/2 + 8);
                ctx.lineTo(size/2 - 8, size/2 + 8);
                ctx.lineTo(size/2 - 8, size);
                ctx.stroke();
                
                // Pedras pequenas
                ctx.fillStyle = '#6b5635';
                for (let i = 0; i < 3; i++) {
                    const x = Math.random() * (size - 8) + 4;
                    const y = Math.random() * (size - 8) + 4;
                    ctx.fillRect(x, y, 2, 2);
                }
                break;

            case 'path_corner_bl':
                // Curva inferior esquerda (conecta esquerda -> cima ou baixo -> direita)
                ctx.fillStyle = '#8b7355';
                ctx.fillRect(0, 0, size, size);
                
                // Desenhar caminho em L
                ctx.fillStyle = '#7a654a';
                ctx.fillRect(0, size/2 - 8, size/2 + 8, 16);  // Horizontal
                ctx.fillRect(size/2 - 8, 0, 16, size/2 + 8);  // Vertical
                
                // Bordas da curva
                ctx.strokeStyle = '#6b5635';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, size/2 - 8);
                ctx.lineTo(size/2 - 8, size/2 - 8);
                ctx.lineTo(size/2 - 8, 0);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(0, size/2 + 8);
                ctx.lineTo(size/2 + 8, size/2 + 8);
                ctx.lineTo(size/2 + 8, 0);
                ctx.stroke();
                
                // Pedras pequenas
                ctx.fillStyle = '#6b5635';
                for (let i = 0; i < 3; i++) {
                    const x = Math.random() * (size - 8) + 4;
                    const y = Math.random() * (size - 8) + 4;
                    ctx.fillRect(x, y, 2, 2);
                }
                break;

            case 'path_corner_br':
                // Curva inferior direita (conecta direita -> cima ou baixo -> esquerda)
                ctx.fillStyle = '#8b7355';
                ctx.fillRect(0, 0, size, size);
                
                // Desenhar caminho em L invertido
                ctx.fillStyle = '#7a654a';
                ctx.fillRect(size/2 - 8, size/2 - 8, size/2 + 8, 16);  // Horizontal
                ctx.fillRect(size/2 - 8, 0, 16, size/2 + 8);  // Vertical
                
                // Bordas da curva
                ctx.strokeStyle = '#6b5635';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(size, size/2 - 8);
                ctx.lineTo(size/2 + 8, size/2 - 8);
                ctx.lineTo(size/2 + 8, 0);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(size, size/2 + 8);
                ctx.lineTo(size/2 - 8, size/2 + 8);
                ctx.lineTo(size/2 - 8, 0);
                ctx.stroke();
                
                // Pedras pequenas
                ctx.fillStyle = '#6b5635';
                for (let i = 0; i < 3; i++) {
                    const x = Math.random() * (size - 8) + 4;
                    const y = Math.random() * (size - 8) + 4;
                    ctx.fillRect(x, y, 2, 2);
                }
                break;

            case 'path_start':
                // Início do caminho
                ctx.fillStyle = '#8b7355';
                ctx.fillRect(0, 0, size, size);
                
                // Marcador de início
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(size/4, size/4, size/2, size/2);
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('I', size/2, size/2 + 4);
                break;

            case 'path_end':
                // Fim do caminho
                ctx.fillStyle = '#8b7355';
                ctx.fillRect(0, 0, size, size);
                
                // Marcador de fim
                ctx.fillStyle = '#f44336';
                ctx.fillRect(size/4, size/4, size/2, size/2);
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('F', size/2, size/2 + 4);
                break;

            case 'stone':
                // Textura de pedra
                ctx.fillStyle = '#6c757d';
                ctx.fillRect(0, 0, size, size);
                
                // Adicionar variações de cor
                ctx.fillStyle = '#5a6169';
                for (let i = 0; i < 6; i++) {
                    const x = Math.random() * size;
                    const y = Math.random() * size;
                    ctx.fillRect(x, y, 3, 3);
                }
                break;

            default:
                // Tile padrão (grama)
                ctx.fillStyle = '#4a7c59';
                ctx.fillRect(0, 0, size, size);
        }

        return canvas;
    }

    // Inicializar imagens padrão
    async initializeDefault(gridSize = 40) {
        try {
            // Primeiro tentar carregar imagens reais
            const imageMap = {
                'grass': 'assets/imagen/Grama.png',
                'path_horizontal': 'assets/imagen/Horizontal.png',
                'path_vertical': 'assets/imagen/Vertical.png',
                'path_corner_tl': 'assets/imagen/Curva TL.png',
                'path_corner_tr': 'assets/imagen/Curva TR.png',
                'path_corner_bl': 'assets/imagen/Curva BL.png',
                'path_corner_br': 'assets/imagen/Curva BR.png',
                'path_start': 'assets/imagen/inicio.png',
                'path_end': 'assets/imagen/fim.png'
            };

            // Tentar carregar todas as imagens
            const loadSuccess = await this.loadImages(imageMap);
            
            if (loadSuccess) {
        
                return true;
            } else {
                console.warn('⚠️ Falha ao carregar imagens reais, usando texturas procedurais como fallback');
                return this.initializeProcedural(gridSize);
            }
        } catch (error) {
            console.error('Erro ao inicializar imagens:', error);
            return this.initializeProcedural(gridSize);
        }
    }

    // Inicializar imagens procedurais (fallback)
    async initializeProcedural(gridSize = 40) {
        try {
            // Criar tiles padrão
            this.defaultImages.grassTile = this.createDefaultTile('grass', gridSize);
            this.defaultImages.stoneTile = this.createDefaultTile('stone', gridSize);
            
            // Criar todos os tipos de caminho
            this.defaultImages.pathHorizontal = this.createDefaultTile('path_horizontal', gridSize);
            this.defaultImages.pathVertical = this.createDefaultTile('path_vertical', gridSize);
            this.defaultImages.pathCornerTL = this.createDefaultTile('path_corner_tl', gridSize);
            this.defaultImages.pathCornerTR = this.createDefaultTile('path_corner_tr', gridSize);
            this.defaultImages.pathCornerBL = this.createDefaultTile('path_corner_bl', gridSize);
            this.defaultImages.pathCornerBR = this.createDefaultTile('path_corner_br', gridSize);
            this.defaultImages.pathStart = this.createDefaultTile('path_start', gridSize);
            this.defaultImages.pathEnd = this.createDefaultTile('path_end', gridSize);
            
            // Registrar como imagens carregadas
            this.images.set('grass', this.defaultImages.grassTile);
            this.images.set('stone', this.defaultImages.stoneTile);
            this.images.set('path_horizontal', this.defaultImages.pathHorizontal);
            this.images.set('path_vertical', this.defaultImages.pathVertical);
            this.images.set('path_corner_tl', this.defaultImages.pathCornerTL);
            this.images.set('path_corner_tr', this.defaultImages.pathCornerTR);
            this.images.set('path_corner_bl', this.defaultImages.pathCornerBL);
            this.images.set('path_corner_br', this.defaultImages.pathCornerBR);
            this.images.set('path_start', this.defaultImages.pathStart);
            this.images.set('path_end', this.defaultImages.pathEnd);
            
    
            return true;
        } catch (error) {
            console.error('Erro ao inicializar imagens procedurais:', error);
            return false;
        }
    }

    // Analisar caminho e detectar tipos de tiles
    analyzePathTiles(pathCoords) {
        const pathTypes = new Map();
        
        for (let i = 0; i < pathCoords.length; i++) {
            const current = pathCoords[i];
            const prev = i > 0 ? pathCoords[i - 1] : null;
            const next = i < pathCoords.length - 1 ? pathCoords[i + 1] : null;
            
            // Determinar tipo do tile
            let tileType = 'path_horizontal'; // padrão
            
            if (i === 0) {
                tileType = 'path_start';
            } else if (i === pathCoords.length - 1) {
                tileType = 'path_end';
            } else {
                // Calcular direções
                const prevDir = prev ? this.getDirection(prev, current) : null;
                const nextDir = next ? this.getDirection(current, next) : null;
                
                if (prevDir && nextDir) {
                    // Verificar se há mudança de direção (curva)
                    if (prevDir !== nextDir) {
                        tileType = this.getCurveType(prevDir, nextDir, prev, current, next);
                    } else {
                        // Linha reta
                        tileType = prevDir === 'horizontal' ? 'path_horizontal' : 'path_vertical';
                    }
                }
            }
            
            pathTypes.set(`${current.x},${current.y}`, tileType);
        }
        
        return pathTypes;
    }
    
    // Obter direção entre dois pontos
    getDirection(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            return 'horizontal';
        } else {
            return 'vertical';
        }
    }
    
    // Determinar tipo de curva baseado nas direções e posições
    getCurveType(prevDir, nextDir, prevPos, currentPos, nextPos) {
        // Calcular vetores de direção
        const dx1 = currentPos.x - prevPos.x;
        const dy1 = currentPos.y - prevPos.y;
        const dx2 = nextPos.x - currentPos.x;
        const dy2 = nextPos.y - currentPos.y;
        
        // Normalizar as direções para -1, 0, 1
        const dirX1 = dx1 > 0 ? 1 : (dx1 < 0 ? -1 : 0);
        const dirY1 = dy1 > 0 ? 1 : (dy1 < 0 ? -1 : 0);
        const dirX2 = dx2 > 0 ? 1 : (dx2 < 0 ? -1 : 0);
        const dirY2 = dy2 > 0 ? 1 : (dy2 < 0 ? -1 : 0);
        
        // Determinar o tipo de curva baseado na combinação das direções
        // Formato: [dirX1, dirY1, dirX2, dirY2]
        const directionKey = `${dirX1},${dirY1},${dirX2},${dirY2}`;
        
        const curveMap = {
            // Vindo da esquerda (1,0) e indo para baixo (0,1)
            '1,0,0,1': 'path_corner_tl',
            // Vindo da esquerda (1,0) e indo para cima (0,-1)
            '1,0,0,-1': 'path_corner_bl',
            // Vindo da direita (-1,0) e indo para baixo (0,1)
            '-1,0,0,1': 'path_corner_tr',
            // Vindo da direita (-1,0) e indo para cima (0,-1)
            '-1,0,0,-1': 'path_corner_br',
            // Vindo de cima (0,-1) e indo para direita (1,0)
            '0,-1,1,0': 'path_corner_tr',
            // Vindo de cima (0,-1) e indo para esquerda (-1,0)
            '0,-1,-1,0': 'path_corner_tl',
            // Vindo de baixo (0,1) e indo para direita (1,0)
            '0,1,1,0': 'path_corner_br',
            // Vindo de baixo (0,1) e indo para esquerda (-1,0)
            '0,1,-1,0': 'path_corner_bl'
        };
        
        return curveMap[directionKey] || 'path_corner_tl';
    }

    // Criar padrão de fundo baseado no grid
    createBackgroundPattern(ctx, canvasWidth, canvasHeight, gridSize, pathCoords) {
        // Analisar tipos de tiles do caminho
        const pathTypes = this.analyzePathTiles(pathCoords);
        
        // Criar um conjunto de coordenadas do caminho para lookup rápido
        const pathSet = new Set(pathCoords.map(coord => `${coord.x},${coord.y}`));
        
        // Calcular quantos tiles cabem
        const tilesX = Math.ceil(canvasWidth / gridSize);
        const tilesY = Math.ceil(canvasHeight / gridSize);
        
        // Desenhar tiles
        for (let x = 0; x < tilesX; x++) {
            for (let y = 0; y < tilesY; y++) {
                const tileKey = `${x},${y}`;
                const posX = x * gridSize;
                const posY = y * gridSize;
                
                let tileImage;
                if (pathSet.has(tileKey)) {
                    // Tile do caminho - usar tipo específico detectado
                    const pathType = pathTypes.get(tileKey) || 'path_horizontal';
                    tileImage = this.getImage(pathType);
                } else {
                    // Tile de grama (área onde torres podem ser colocadas)
                    tileImage = this.getImage('grass');
                }
                
                if (tileImage) {
                    ctx.drawImage(tileImage, posX, posY, gridSize, gridSize);
                }
            }
        }
    }

    // Limpar cache de imagens
    clearCache() {
        this.images.clear();
        this.loadingPromises.clear();
    }

    // Obter informações sobre imagens carregadas
    getStats() {
        return {
            loadedImages: this.images.size,
            loadingImages: this.loadingPromises.size,
            imageKeys: Array.from(this.images.keys())
        };
    }
}

// Instância global do gerenciador de imagens
export const imageManager = new ImageManager(); 