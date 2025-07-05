// Sistema da Árvore de Habilidades
// ---------------------------------
// Estrutura dos upgrades globais do jogo Legado da Fortaleza

export const SKILL_TREE = [
    // VIDA (coluna 1)
    { id: 'defesa', name: 'Defesa', desc: 'Reduz dano recebido em 10% por nível', max: 3, cost: 2, parent: 'cura', branch: 'vida', children: [], row: 1, col: 1 },
    { id: 'cura', name: 'Cura Passiva', desc: 'Regenera 1 de vida a cada 20s', max: 3, cost: 2, parent: 'vida', branch: 'vida', children: ['defesa'], row: 2, col: 1 },
    { id: 'vida', name: 'Vida Inicial +', desc: '+1 de vida inicial por nível', max: 5, cost: 1, parent: null, branch: 'vida', children: ['cura'], row: 3, col: 1 },

    // DANO (coluna 2)
    { id: 'vel_arq', name: 'Velocidade Arqueiro +', desc: '+10% de velocidade de ataque Arqueiro', max: 3, cost: 2, parent: 'dano_arq', branch: 'dano', children: [], row: 1, col: 2 },
    { id: 'alc_can', name: 'Área Explosão +', desc: '+15% de área de efeito da explosão', max: 2, cost: 2, parent: 'dano_can', branch: 'dano', children: [], row: 1, col: 2 },
    { id: 'cong_mag', name: 'Congelamento Mago +', desc: '+1s de congelamento', max: 2, cost: 2, parent: 'dano_mag', branch: 'dano', children: [], row: 1, col: 2 },
    { id: 'enc_tes', name: 'Encadeamento Tesla +', desc: '+1 inimigo encadeado', max: 2, cost: 2, parent: 'dano_tes', branch: 'dano', children: [], row: 1, col: 2 },
    { id: 'dano_arq', name: 'Dano Arqueiro +', desc: '+10% de dano para torres Arqueiro', max: 3, cost: 2, parent: 'dano', branch: 'dano', children: ['vel_arq'], row: 2, col: 2 },
    { id: 'dano_can', name: 'Dano Canhão +', desc: '+10% de dano para torres Canhão', max: 3, cost: 2, parent: 'dano', branch: 'dano', children: ['alc_can'], row: 2, col: 2 },
    { id: 'dano_mag', name: 'Dano Mago +', desc: '+10% de dano para torres Mago', max: 3, cost: 2, parent: 'dano', branch: 'dano', children: ['cong_mag'], row: 2, col: 2 },
    { id: 'dano_tes', name: 'Dano Tesla +', desc: '+10% de dano para torres Tesla', max: 3, cost: 2, parent: 'dano', branch: 'dano', children: ['enc_tes'], row: 2, col: 2 },
    { id: 'dano', name: 'Dano Global +', desc: '+5% de dano para todas as torres por nível', max: 5, cost: 1, parent: null, branch: 'dano', children: ['dano_arq', 'dano_can', 'dano_mag', 'dano_tes'], row: 3, col: 2 },

    // ESPECIAL (coluna 3)
    { id: 'gelo', name: 'Tempestade de Gelo', desc: 'Aumenta a duração do congelamento da Tempestade de Gelo em +1s por nível.', max: 2, cost: 3, parent: 'esp', branch: 'esp', children: [], row: 2, col: 3 },
    { id: 'chuva', name: 'Chuva de Flechas +', desc: 'Aprimora a Chuva de Flechas', max: 3, cost: 2, parent: 'esp', branch: 'esp', children: [], row: 2, col: 3 },
    { id: 'ouro', name: 'Ouro extra por onda', desc: '+10% de ouro ao vencer uma onda', max: 3, cost: 2, parent: 'esp', branch: 'esp', children: [], row: 2, col: 3 },
    { id: 'torre', name: 'Desbloquear Torre Especial', desc: 'Nova torre exclusiva', max: 1, cost: 3, parent: 'esp', branch: 'esp', children: [], row: 2, col: 3 },
    { id: 'esp', name: 'Especial', desc: 'Desbloqueia habilidades especiais', max: 1, cost: 1, parent: null, branch: 'esp', children: ['chuva', 'gelo', 'ouro', 'torre'], row: 3, col: 3 },
];

export const SKILL_ICONS = {
    vida: '❤️', cura: '💚', defesa: '🛡️',
    dano: '⚔️', dano_arq: '🏹', vel_arq: '💨', dano_can: '💣', alc_can: '💥', dano_mag: '🔮', cong_mag: '❄️', dano_tes: '⚡', enc_tes: '🔗',
    esp: '✨', chuva: '🏹', gelo: '❄️', ouro: '��', torre: '🌟'
};

/**
 * Inicializa o painel da árvore de habilidades em um container.
 * @param {string} containerId - ID do container onde o painel será renderizado
 * @param {object} skillTree - Estado atual dos upgrades do jogador
 * @param {number} skillPoints - Pontos disponíveis
 */
export function initSkillTreePanel(containerId, skillTree, skillPoints) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    // Painel principal: flexbox horizontal
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.justifyContent = 'center';
    container.style.gap = '32px';
    // Renderizar as três colunas (Vida, Dano, Especial)
    const branches = [
        { title: 'Vida', branch: 'vida', gridId: 'skill-tree-vida' },
        { title: 'Dano', branch: 'dano', gridId: 'skill-tree-dano' },
        { title: 'Especial', branch: 'esp', gridId: 'skill-tree-especial' }
    ];
    branches.forEach(({ title, branch, gridId }) => {
        const panel = document.createElement('div');
        panel.className = 'skill-tree-panel';
        panel.style.display = 'flex';
        panel.style.flexDirection = 'column';
        panel.style.alignItems = 'center';
        panel.style.width = '340px';
        panel.style.minWidth = '260px';
        panel.style.maxWidth = '340px';
        const titleDiv = document.createElement('div');
        titleDiv.className = 'skill-tree-title';
        titleDiv.textContent = title;
        panel.appendChild(titleDiv);
        const grid = document.createElement('div');
        grid.className = 'skill-tree-grid';
        grid.id = gridId;
        grid.style.display = 'flex';
        grid.style.flexDirection = 'column';
        grid.style.alignItems = 'center';
        grid.style.width = '100%';
        panel.appendChild(grid);
        container.appendChild(panel);
        renderSkillTreeColumn(branch, gridId, skillTree, skillPoints);
    });
}

// Corrigir renderSkillTreeColumn para NÃO criar linhas horizontais extras, apenas empilhar os nós verticalmente
function renderSkillTreeColumn(branch, containerId, skillTree, skillPoints) {
    const tree = SKILL_TREE.filter(node => node.branch === branch || node.id === branch);
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    // Agrupar por camadas (row)
    const layers = {};
    tree.forEach(node => {
        if (!layers[node.row]) layers[node.row] = [];
        layers[node.row].push(node);
    });
    const maxRow = Math.max(...tree.map(n => n.row));
    // Renderizar cada camada: se houver mais de um nó, centralizar em flex row
    const nodeDivs = {};
    const rowDivs = {};
    for (let row = 1; row <= maxRow; row++) {
        const layer = layers[row] || [];
        const rowDiv = document.createElement('div');
        rowDiv.className = 'skill-tree-row';
        rowDiv.style.display = 'flex';
        rowDiv.style.justifyContent = 'center';
        rowDiv.style.gap = '16px';
        rowDiv.style.position = 'relative';
        rowDiv.style.height = '80px';
        rowDivs[row] = rowDiv;
        layer.forEach(node => {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'skill-node';
            nodeDiv.innerHTML = `<div class="skill-icon-box"><span class="skill-icon">${SKILL_ICONS[node.id] || '❔'}</span></div>`;
            nodeDiv.style.position = 'relative';
            nodeDiv.style.zIndex = 2;
            nodeDivs[node.id] = nodeDiv;
            // Tooltip
            const level = skillTree[node.id] || 0;
            const canUpgrade = (level < node.max) && (skillPoints >= node.cost) && canUnlockSkill(node, skillTree);
            const unlocked = level > 0;
            const locked = !canUpgrade && level < node.max;
            const atMax = level >= node.max;
            let statusText = '';
            let lockReason = '';
            if (atMax) {
                statusText = 'Máximo';
            } else if (unlocked) {
                statusText = 'Desbloqueada';
            } else if (canUpgrade) {
                statusText = 'Disponível';
            } else {
                statusText = 'Bloqueada';
                // Motivo do bloqueio
                if (level < node.max && skillPoints < node.cost) {
                    lockReason = 'Pontos insuficientes';
                } else if (!canUnlockSkill(node, skillTree)) {
                    lockReason = 'Pré-requisito não atendido';
                } else {
                    lockReason = 'Bloqueada';
                }
            }
            const tooltip = document.createElement('div');
            tooltip.className = 'skill-tooltip';
            tooltip.innerHTML = `<b>${node.name}</b><br>${node.desc}<br><span style='color:#b26a00;font-size:0.95em;'>${statusText}</span><br>Custo: ${node.cost}<br>Nível: ${level}/${node.max}` + (lockReason ? `<br><span style='color:#888;font-size:0.9em;'>${lockReason}</span>` : '');
            nodeDiv.appendChild(tooltip);
            nodeDiv.onmouseenter = () => { tooltip.style.display = 'block'; };
            nodeDiv.onmouseleave = () => { tooltip.style.display = 'none'; };
            // Ícone de cadeado se bloqueado
            if (locked && !unlocked) {
                const lockIcon = document.createElement('div');
                lockIcon.className = 'skill-lock-icon';
                lockIcon.innerHTML = '🔒';
                lockIcon.style.position = 'absolute';
                lockIcon.style.top = '50%';
                lockIcon.style.left = '50%';
                lockIcon.style.transform = 'translate(-50%, -50%)';
                lockIcon.style.fontSize = '1.5em';
                lockIcon.style.pointerEvents = 'none';
                lockIcon.style.zIndex = '10';
                nodeDiv.appendChild(lockIcon);
                // Borda azul para nós bloqueados
                nodeDiv.style.border = '2px solid #0066cc';
            }
            // Evento de clique para evoluir
            if (canUpgrade) {
                nodeDiv.style.cursor = 'pointer';
                nodeDiv.onclick = () => {

                    // Atualizar skillTree e pontos
                    const newSkillTree = { ...skillTree };
                    newSkillTree[node.id] = (newSkillTree[node.id] || 0) + 1;
                    let newPoints = skillPoints - node.cost;
                    // Salvar no localStorage
                    localStorage.setItem('arqueiroSkillTree', JSON.stringify(newSkillTree));
                    localStorage.setItem('arqueiroUpgradePoints', newPoints);
                    // Recarregar do localStorage para garantir estado atualizado
                    const updatedSkillTree = JSON.parse(localStorage.getItem('arqueiroSkillTree'));
                    const updatedPoints = parseInt(localStorage.getItem('arqueiroUpgradePoints') || '0');
                    // Atualizar exibição dos pontos se existir
                    if (document.getElementById('upgradePoints')) document.getElementById('upgradePoints').textContent = updatedPoints;
                    if (document.getElementById('globalSkillPoints')) document.getElementById('globalSkillPoints').textContent = updatedPoints;
                    // Re-renderizar árvore com estado atualizado
                    initSkillTreePanel('skill-tree-multi-panel', updatedSkillTree, updatedPoints);
                    
                    // DISPARAR EVENTO PARA NOTIFICAR MUDANÇA NA SKILL TREE

                    document.dispatchEvent(new CustomEvent('skillTreeChanged', { 
                        detail: { 
                            nodeId: node.id, 
                            newLevel: newSkillTree[node.id],
                            skillTree: updatedSkillTree 
                        } 
                    }));
                };
            } else {
                nodeDiv.style.cursor = 'default';
                nodeDiv.onclick = null;
            }
            if (atMax) {
                nodeDiv.style.boxShadow = '0 0 0 3px #ff2d2d, 0 0 12px #ff2d2d88';
            } else {
                nodeDiv.style.boxShadow = '';
            }
            rowDiv.appendChild(nodeDiv);
        });
        container.appendChild(rowDiv);
    }
    // Desenhar conexões SVG entre os nós (após renderizar)
    setTimeout(() => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('skill-conn');
        svg.setAttribute('width', container.offsetWidth);
        svg.setAttribute('height', container.offsetHeight);
        svg.style.position = 'absolute';
        svg.style.left = '0';
        svg.style.top = '0';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = 1;
        tree.forEach(node => {
            if (!node.parent) return;
            const from = nodeDivs[node.parent];
            const to = nodeDivs[node.id];
            if (!from || !to) return;
            const fromRect = from.getBoundingClientRect();
            const toRect = to.getBoundingClientRect();
            const contRect = container.getBoundingClientRect();
            const x1 = fromRect.left + fromRect.width/2 - contRect.left;
            const y1 = fromRect.top + fromRect.height - contRect.top;
            const x2 = toRect.left + toRect.width/2 - contRect.left;
            const y2 = toRect.top - contRect.top;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            svg.appendChild(line);
        });
        const oldSvg = container.querySelector('.skill-conn');
        if (oldSvg) oldSvg.remove();
        container.appendChild(svg);
    }, 10);
}

// Função para checar se pode desbloquear uma habilidade
function canUnlockSkill(node, skillTree) {
    if (!node.parent) return true;
    const parentLevel = skillTree[node.parent] || 0;
    return parentLevel > 0;
} 