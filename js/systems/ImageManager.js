// Sistema de Gerenciamento de Imagens
export class ImageManager {
    // Constantes para cores e configurações
    static COLORS = {
        GRASS: {
            PRIMARY: '#4a7c59',
            DETAIL: '#5e8f6f'
        },
        PATH: {
            PRIMARY: '#8b7355',
            BORDER: '#6b5635',
            DETAIL: '#7a654a'
        },
        STONE: {
            PRIMARY: '#6c757d',
            DETAIL: '#5a6169'
        },
        MARKERS: {
            START: '#4CAF50',
            END: '#f44336',
            TEXT: '#ffffff'
        }
    };

    static TILE_CONFIG = {
        DEFAULT_SIZE: 40,
        PATH_WIDTH: 16,
        PATH_OFFSET: 8,
        BORDER_WIDTH: 3,
        DETAIL_COUNT: {
            GRASS: 8,
            PATH: 5,
            CORNER: 3,
            STONE: 6
        }
    };

    constructor() {
        this.images = new Map();
        this.loadingPromises = new Map();
        this.defaultImages = {
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

    // Métodos auxiliares para criação de tiles
    _createBaseTile(ctx, size, color) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, size, size);
    }

    _addRandomDetails(ctx, size, color, count, detailSize = 2) {
        ctx.fillStyle = color;
        for (let i = 0; i < count; i++) {
            const x = Math.random() * (size - detailSize);
            const y = Math.random() * (size - detailSize);
            ctx.fillRect(x, y, detailSize, detailSize);
        }
    }

    _createPathTile(ctx, size) {
        this._createBaseTile(ctx, size, ImageManager.COLORS.PATH.PRIMARY);
        this._addRandomDetails(ctx, size, ImageManager.COLORS.PATH.DETAIL, ImageManager.TILE_CONFIG.DETAIL_COUNT.PATH, 3);
    }

    _createPathBorders(ctx, size, isHorizontal) {
        ctx.fillStyle = ImageManager.COLORS.PATH.BORDER;
        if (isHorizontal) {
            ctx.fillRect(0, 0, size, ImageManager.TILE_CONFIG.BORDER_WIDTH);
            ctx.fillRect(0, size - ImageManager.TILE_CONFIG.BORDER_WIDTH, size, ImageManager.TILE_CONFIG.BORDER_WIDTH);
        } else {
            ctx.fillRect(0, 0, ImageManager.TILE_CONFIG.BORDER_WIDTH, size);
            ctx.fillRect(size - ImageManager.TILE_CONFIG.BORDER_WIDTH, 0, ImageManager.TILE_CONFIG.BORDER_WIDTH, size);
        }
    }

    _createCornerPath(ctx, size, horizontalRect, verticalRect) {
        this._createBaseTile(ctx, size, ImageManager.COLORS.PATH.PRIMARY);
        
        // Desenhar caminho em L
        ctx.fillStyle = ImageManager.COLORS.PATH.DETAIL;
        ctx.fillRect(...horizontalRect);
        ctx.fillRect(...verticalRect);
        
        // Adicionar detalhes
        this._addRandomDetails(ctx, size, ImageManager.COLORS.PATH.BORDER, ImageManager.TILE_CONFIG.DETAIL_COUNT.CORNER, 2);
    }

    _createCornerBorders(ctx, size, borderPaths) {
        ctx.strokeStyle = ImageManager.COLORS.PATH.BORDER;
        ctx.lineWidth = ImageManager.TILE_CONFIG.BORDER_WIDTH;
        
        borderPaths.forEach(path => {
            ctx.beginPath();
            ctx.moveTo(...path[0]);
            ctx.lineTo(...path[1]);
            ctx.lineTo(...path[2]);
            ctx.stroke();
        });
    }

    _createMarkerTile(ctx, size, color, text) {
        this._createBaseTile(ctx, size, ImageManager.COLORS.PATH.PRIMARY);
        
        // Marcador
        ctx.fillStyle = color;
        ctx.fillRect(size/4, size/4, size/2, size/2);
        
        // Texto
        ctx.fillStyle = ImageManager.COLORS.MARKERS.TEXT;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, size/2, size/2 + 4);
    }

    // Criar imagem padrão (tiles procedurais)
    createDefaultTile(type, size = ImageManager.TILE_CONFIG.DEFAULT_SIZE) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const { PATH_WIDTH, PATH_OFFSET } = ImageManager.TILE_CONFIG;

        switch(type) {
            case 'grass':
                this._createBaseTile(ctx, size, ImageManager.COLORS.GRASS.PRIMARY);
                this._addRandomDetails(ctx, size, ImageManager.COLORS.GRASS.DETAIL, ImageManager.TILE_CONFIG.DETAIL_COUNT.GRASS);
                break;

            case 'path_horizontal':
                this._createPathTile(ctx, size);
                this._createPathBorders(ctx, size, true);
                break;

            case 'path_vertical':
                this._createPathTile(ctx, size);
                this._createPathBorders(ctx, size, false);
                break;

            case 'path_corner_tl':
                this._createCornerPath(ctx, size, 
                    [0, size/2 - PATH_OFFSET, size/2 + PATH_OFFSET, PATH_WIDTH],
                    [size/2 - PATH_OFFSET, size/2 - PATH_OFFSET, PATH_WIDTH, size/2 + PATH_OFFSET]
                );
                this._createCornerBorders(ctx, size, [
                    [[0, size/2 - PATH_OFFSET], [size/2 - PATH_OFFSET, size/2 - PATH_OFFSET], [size/2 - PATH_OFFSET, size]],
                    [[0, size/2 + PATH_OFFSET], [size/2 + PATH_OFFSET, size/2 + PATH_OFFSET], [size/2 + PATH_OFFSET, size]]
                ]);
                break;

            case 'path_corner_tr':
                this._createCornerPath(ctx, size,
                    [size/2 - PATH_OFFSET, size/2 - PATH_OFFSET, size/2 + PATH_OFFSET, PATH_WIDTH],
                    [size/2 - PATH_OFFSET, size/2 - PATH_OFFSET, PATH_WIDTH, size/2 + PATH_OFFSET]
                );
                this._createCornerBorders(ctx, size, [
                    [[size, size/2 - PATH_OFFSET], [size/2 + PATH_OFFSET, size/2 - PATH_OFFSET], [size/2 + PATH_OFFSET, size]],
                    [[size, size/2 + PATH_OFFSET], [size/2 - PATH_OFFSET, size/2 + PATH_OFFSET], [size/2 - PATH_OFFSET, size]]
                ]);
                break;

            case 'path_corner_bl':
                this._createCornerPath(ctx, size,
                    [0, size/2 - PATH_OFFSET, size/2 + PATH_OFFSET, PATH_WIDTH],
                    [size/2 - PATH_OFFSET, 0, PATH_WIDTH, size/2 + PATH_OFFSET]
                );
                this._createCornerBorders(ctx, size, [
                    [[0, size/2 - PATH_OFFSET], [size/2 - PATH_OFFSET, size/2 - PATH_OFFSET], [size/2 - PATH_OFFSET, 0]],
                    [[0, size/2 + PATH_OFFSET], [size/2 + PATH_OFFSET, size/2 + PATH_OFFSET], [size/2 + PATH_OFFSET, 0]]
                ]);
                break;

            case 'path_corner_br':
                this._createCornerPath(ctx, size,
                    [size/2 - PATH_OFFSET, size/2 - PATH_OFFSET, size/2 + PATH_OFFSET, PATH_WIDTH],
                    [size/2 - PATH_OFFSET, 0, PATH_WIDTH, size/2 + PATH_OFFSET]
                );
                this._createCornerBorders(ctx, size, [
                    [[size, size/2 - PATH_OFFSET], [size/2 + PATH_OFFSET, size/2 - PATH_OFFSET], [size/2 + PATH_OFFSET, 0]],
                    [[size, size/2 + PATH_OFFSET], [size/2 - PATH_OFFSET, size/2 + PATH_OFFSET], [size/2 - PATH_OFFSET, 0]]
                ]);
                break;

            case 'path_start':
                this._createMarkerTile(ctx, size, ImageManager.COLORS.MARKERS.START, 'I');
                break;

            case 'path_end':
                this._createMarkerTile(ctx, size, ImageManager.COLORS.MARKERS.END, 'F');
                break;

            case 'stone':
                this._createBaseTile(ctx, size, ImageManager.COLORS.STONE.PRIMARY);
                this._addRandomDetails(ctx, size, ImageManager.COLORS.STONE.DETAIL, ImageManager.TILE_CONFIG.DETAIL_COUNT.STONE, 3);
                break;

            default:
                this._createBaseTile(ctx, size, ImageManager.COLORS.GRASS.PRIMARY);
        }

        return canvas;
    }

    // Inicializar imagens padrão
    async initializeDefault(gridSize = ImageManager.TILE_CONFIG.DEFAULT_SIZE) {
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
    async initializeProcedural(gridSize = ImageManager.TILE_CONFIG.DEFAULT_SIZE) {
        try {
            const tileTypes = [
                'grass', 'stone', 'path_horizontal', 'path_vertical',
                'path_corner_tl', 'path_corner_tr', 'path_corner_bl', 'path_corner_br',
                'path_start', 'path_end'
            ];

            // Criar e registrar todos os tiles
            tileTypes.forEach(type => {
                const tile = this.createDefaultTile(type, gridSize);
                this.images.set(type, tile);
                
                // Manter referência para tiles básicos
                if (type === 'grass') this.defaultImages.grassTile = tile;
                if (type === 'stone') this.defaultImages.stoneTile = tile;
            });

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