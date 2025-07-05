// Debug Layout - Arquivo para verificar e corrigir layout do jogo

function debugLayout() {
    console.log('🔍 VERIFICANDO LAYOUT...');
    
    // Verificar elementos principais
    const canvas = document.getElementById('gameCanvas');
    const uiPanel = document.querySelector('.ui-panel');
    const skillsBar = document.getElementById('specialSkillsFixedBar') || document.querySelector('.skills-container');
    const arrowBtn = document.getElementById('btnArrowRain');
    const iceBtn = document.getElementById('btnIceStorm');
    
    console.log('📋 Status dos elementos:');
    console.log('Canvas:', canvas ? '✅ Encontrado' : '❌ Não encontrado');
    console.log('UI Panel:', uiPanel ? '✅ Encontrado' : '❌ Não encontrado');
    console.log('Skills Bar:', skillsBar ? '✅ Encontrado' : '❌ Não encontrado');
    console.log('Arrow Btn:', arrowBtn ? '✅ Encontrado' : '❌ Não encontrado');
    console.log('Ice Btn:', iceBtn ? '✅ Encontrado' : '❌ Não encontrado');
    
    // Verificar estilos aplicados
    if (canvas) {
        const marginLeft = window.getComputedStyle(canvas).marginLeft;
        console.log('📏 Canvas margin-left:', marginLeft);
        console.log('✅ Esperado: 250px');
    }
    
    if (uiPanel) {
        const position = window.getComputedStyle(uiPanel).position;
        const width = window.getComputedStyle(uiPanel).width;
        console.log('📐 UI Panel position:', position);
        console.log('📐 UI Panel width:', width);
        console.log('✅ Esperado: fixed e 250px');
    }
    
    if (skillsBar) {
        const position = window.getComputedStyle(skillsBar).position;
        const bottom = window.getComputedStyle(skillsBar).bottom;
        console.log('📐 Skills Bar position:', position);
        console.log('📐 Skills Bar bottom:', bottom);
        console.log('✅ Esperado: fixed e 120px');
    }
    
    // Verificar se ambas habilidades estão visíveis
    if (arrowBtn && iceBtn) {
        const arrowDisplay = window.getComputedStyle(arrowBtn).display;
        const iceDisplay = window.getComputedStyle(iceBtn).display;
        console.log('👁️ Arrow Rain display:', arrowDisplay);
        console.log('👁️ Ice Storm display:', iceDisplay);
        console.log('✅ Esperado: flex para ambos');
    }
    
    return {
        canvas,
        uiPanel,
        skillsBar,
        arrowBtn,
        iceBtn
    };
}

function forceFixLayout() {
    console.log('🔧 FORÇANDO CORREÇÃO DE LAYOUT...');
    
    const elements = debugLayout();
    
    if (elements.canvas) {
        elements.canvas.style.marginLeft = '250px';
        elements.canvas.style.marginTop = '80px';
        console.log('✅ Canvas corrigido');
    }
    
    if (elements.uiPanel) {
        elements.uiPanel.style.position = 'fixed';
        elements.uiPanel.style.width = '250px';
        elements.uiPanel.style.zIndex = '90';
        console.log('✅ UI Panel corrigido');
    }
    
    if (elements.skillsBar) {
        elements.skillsBar.style.position = 'fixed';
        elements.skillsBar.style.bottom = '120px';
        elements.skillsBar.style.display = 'flex';
        elements.skillsBar.style.justifyContent = 'space-between';
        console.log('✅ Skills Bar corrigido');
    }
    
    if (elements.arrowBtn) {
        elements.arrowBtn.style.display = 'flex';
        elements.arrowBtn.style.order = '1';
        console.log('✅ Arrow Rain corrigido');
    }
    
    if (elements.iceBtn) {
        elements.iceBtn.style.display = 'flex';
        elements.iceBtn.style.order = '2';
        console.log('✅ Ice Storm corrigido');
    }
    
    console.log('🎯 Layout forçado aplicado!');
}

function testResponsiveLayout() {
    console.log('📱 TESTANDO LAYOUT RESPONSIVO...');
    
    const screenWidth = window.innerWidth;
    console.log('📏 Largura da tela:', screenWidth + 'px');
    
    const elements = debugLayout();
    
    if (screenWidth <= 480) {
        console.log('📱 Aplicando layout MOBILE');
        if (elements.uiPanel) elements.uiPanel.style.width = '50px';
        if (elements.canvas) elements.canvas.style.marginLeft = '50px';
    } else if (screenWidth <= 768) {
        console.log('📱 Aplicando layout TABLET');
        if (elements.uiPanel) elements.uiPanel.style.width = '60px';
        if (elements.canvas) elements.canvas.style.marginLeft = '60px';
    } else if (screenWidth <= 900) {
        console.log('💻 Aplicando layout DESKTOP PEQUENO');
        if (elements.uiPanel) elements.uiPanel.style.width = '180px';
        if (elements.canvas) elements.canvas.style.marginLeft = '180px';
    } else {
        console.log('🖥️ Aplicando layout DESKTOP COMPLETO');
        if (elements.uiPanel) elements.uiPanel.style.width = '250px';
        if (elements.canvas) elements.canvas.style.marginLeft = '250px';
    }
}

function createDebugPanel() {
    const existingPanel = document.getElementById('debug-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #000;
        color: #0f0;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 999999;
        max-width: 300px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    `;
    
    panel.innerHTML = `
        <div style="color: #ff0; font-weight: bold; margin-bottom: 10px;">🔧 DEBUG LAYOUT</div>
        <button onclick="debugLayout()" style="margin: 2px; padding: 5px; background: #333; color: #0f0; border: 1px solid #0f0; border-radius: 3px; cursor: pointer;">Debug Layout</button>
        <button onclick="forceFixLayout()" style="margin: 2px; padding: 5px; background: #333; color: #ff0; border: 1px solid #ff0; border-radius: 3px; cursor: pointer;">Force Fix</button>
        <button onclick="testResponsiveLayout()" style="margin: 2px; padding: 5px; background: #333; color: #0ff; border: 1px solid #0ff; border-radius: 3px; cursor: pointer;">Test Responsive</button>
        <button onclick="window.testMenuButton()" style="margin: 2px; padding: 5px; background: #333; color: #fc0; border: 1px solid #fc0; border-radius: 3px; cursor: pointer;">Test Menu Btn</button>
        <br>
        <button onclick="debugMainMenu()" style="margin: 2px; padding: 5px; background: #333; color: #f0f; border: 1px solid #f0f; border-radius: 3px; cursor: pointer;">Debug Menu</button>
        <button onclick="forceHideMenu()" style="margin: 2px; padding: 5px; background: #333; color: #fa0; border: 1px solid #fa0; border-radius: 3px; cursor: pointer;">Hide Menu</button>
        <button onclick="forceShowMenu()" style="margin: 2px; padding: 5px; background: #333; color: #0af; border: 1px solid #0af; border-radius: 3px; cursor: pointer;">Show Menu</button>
        <button onclick="window.returnToMenu(false)" style="margin: 2px; padding: 5px; background: #333; color: #fff; border: 1px solid #fff; border-radius: 3px; cursor: pointer;">Return to Menu</button>
        <br>
        <button onclick="testMenuNavigation()" style="margin: 2px; padding: 5px; background: #333; color: #0f8; border: 1px solid #0f8; border-radius: 3px; cursor: pointer;">Test Navigation</button>
        <button onclick="testFullNavigation()" style="margin: 2px; padding: 5px; background: #333; color: #08f; border: 1px solid #08f; border-radius: 3px; cursor: pointer;">Full Nav Test</button>
        <br>
        <button onclick="document.getElementById('debug-panel').remove()" style="margin: 2px; padding: 5px; background: #333; color: #f00; border: 1px solid #f00; border-radius: 3px; cursor: pointer;">Close</button>
    `;
    
    document.body.appendChild(panel);
    console.log('🔧 Painel de debug criado no canto superior direito');
}

// Função para debugar o menu principal
function debugMainMenu() {
    console.log('🎮 DEBUG DO MENU PRINCIPAL');
    console.log('===========================');
    
    const menu = document.getElementById('mainMenu');
    const isGameRunning = document.body.classList.contains('game-running');
    const gameSystem = window.gameSystem;
    
    console.log('📋 Estado do Menu:');
    console.log(`   Menu encontrado: ${menu ? '✅ Sim' : '❌ Não'}`);
    if (menu) {
        console.log(`   Menu display: ${menu.style.display || 'não definido'}`);
        console.log(`   Menu visível: ${menu.offsetWidth > 0 ? '✅ Sim' : '❌ Não'}`);
        console.log(`   Menu z-index: ${window.getComputedStyle(menu).zIndex}`);
    }
    
    console.log('🎮 Estado do Jogo:');
    console.log(`   Classe game-running: ${isGameRunning ? '✅ Ativa' : '❌ Inativa'}`);
    console.log(`   GameSystem existe: ${gameSystem ? '✅ Sim' : '❌ Não'}`);
    if (gameSystem) {
        console.log(`   GameSystem rodando: ${gameSystem.isRunning ? '✅ Sim' : '❌ Não'}`);
    }
    
    // Verificar elementos de jogo
    const gameElements = {
        canvas: document.getElementById('gameCanvas'),
        uiPanel: document.querySelector('.ui-panel'),
        towerBar: document.querySelector('.footer-tower-bar'),
        skillsBar: document.getElementById('specialSkillsFixedBar') || document.querySelector('.skills-container')
    };
    
    console.log('🕹️ Elementos de Jogo:');
    Object.entries(gameElements).forEach(([name, element]) => {
        const visible = element && element.offsetWidth > 0;
        console.log(`   ${name}: ${visible ? '✅ Visível' : '❌ Oculto'}`);
    });
    
    // Verificar se há conflito
    const menuVisible = menu && menu.style.display !== 'none' && menu.offsetWidth > 0;
    const gameVisible = Object.values(gameElements).some(el => el && el.offsetWidth > 0);
    
    if (menuVisible && gameVisible) {
        console.log('⚠️ CONFLITO DETECTADO: Menu e jogo estão visíveis ao mesmo tempo!');
    }
    
    return {
        menuVisible,
        gameVisible,
        isGameRunning,
        gameSystemRunning: gameSystem ? gameSystem.isRunning : false
    };
}

// Função para forçar esconder o menu
function forceHideMenu() {
    console.log('🔧 FORÇANDO ESCONDER MENU...');
    
    const menu = document.getElementById('mainMenu');
    if (menu) {
        menu.style.display = 'none';
        menu.style.visibility = 'hidden';
        menu.style.opacity = '0';
        menu.style.zIndex = '-1';
        
        document.body.classList.add('game-running');
        
        console.log('✅ Menu forçadamente escondido');
    } else {
        console.log('❌ Menu não encontrado');
    }
}

// Função para mostrar o menu (útil para voltar ao menu principal)
function forceShowMenu() {
    console.log('📋 FORÇANDO MOSTRAR MENU...');
    
    const menu = document.getElementById('mainMenu');
    if (menu) {
        menu.style.display = 'flex';
        menu.style.visibility = 'visible';
        menu.style.opacity = '1';
        menu.style.zIndex = '10000';
        
        document.body.classList.remove('game-running');
        
        console.log('✅ Menu forçadamente mostrado');
    } else {
        console.log('❌ Menu não encontrado');
    }
}

// Função para testar navegação completa do menu
function testMenuNavigation() {
    console.log('🔄 TESTE DE NAVEGAÇÃO DO MENU');
    console.log('==============================');
    
    const tests = {
        menuElement: document.getElementById('mainMenu') !== null,
        playButton: document.getElementById('btnPlay') !== null,
        continueButton: document.getElementById('btnContinue') !== null,
        menuButton: document.getElementById('btnBackToMenu') !== null,
        restartButton: document.getElementById('restart') !== null,
        showMainMenuFunction: typeof window.showMainMenu === 'function',
        hideMainMenuFunction: typeof window.hideMainMenu === 'function',
        returnToMenuFunction: typeof window.returnToMenu === 'function'
    };
    
    console.log('📋 Elementos de Navegação:');
    Object.entries(tests).forEach(([test, status]) => {
        console.log(`   ${status ? '✅' : '❌'} ${test}: ${status ? 'OK' : 'ERRO'}`);
    });
    
    // Testar visibilidade do menu
    const menu = document.getElementById('mainMenu');
    if (menu) {
        const isVisible = menu.style.display !== 'none' && menu.offsetWidth > 0;
        const hasGameRunningClass = document.body.classList.contains('game-running');
        
        console.log('🎮 Estado Atual:');
        console.log(`   Menu visível: ${isVisible ? '✅ Sim' : '❌ Não'}`);
        console.log(`   Jogo rodando: ${hasGameRunningClass ? '✅ Sim' : '❌ Não'}`);
        console.log(`   GameSystem ativo: ${window.gameSystem?.isRunning ? '✅ Sim' : '❌ Não'}`);
    }
    
    // Verificar estilos do menu
    if (menu) {
        const menuContent = menu.querySelector('.main-menu-content');
        if (menuContent) {
            const styles = window.getComputedStyle(menuContent);
            console.log('🎨 Estilos do Menu:');
            console.log(`   Background: ${styles.background ? '✅ Aplicado' : '❌ Não aplicado'}`);
            console.log(`   Border: ${styles.border !== 'none' ? '✅ Aplicado' : '❌ Não aplicado'}`);
            console.log(`   Border-radius: ${styles.borderRadius !== '0px' ? '✅ Aplicado' : '❌ Não aplicado'}`);
            console.log(`   Box-shadow: ${styles.boxShadow !== 'none' ? '✅ Aplicado' : '❌ Não aplicado'}`);
        }
    }
    
    return tests;
}

// Função para testar sequência completa de navegação
function testFullNavigation() {
    console.log('🔄 TESTE COMPLETO DE NAVEGAÇÃO');
    console.log('===============================');
    
    console.log('1. 📋 Verificando estado inicial...');
    testMenuNavigation();
    
    console.log('\n2. 🎮 Simulando entrada no jogo...');
    if (typeof window.hideMainMenu === 'function') {
        window.hideMainMenu();
        console.log('✅ Menu escondido');
    }
    
    setTimeout(() => {
        console.log('\n3. 🏠 Simulando volta ao menu...');
        if (typeof window.showMainMenu === 'function') {
            window.showMainMenu();
            console.log('✅ Menu mostrado novamente');
        }
        
        console.log('\n4. ✅ Teste de navegação completo!');
    }, 1000);
}

// Exportar funções para o escopo global
window.debugLayout = debugLayout;
window.forceFixLayout = forceFixLayout;
window.testResponsiveLayout = testResponsiveLayout;
window.createDebugPanel = createDebugPanel;
window.debugMainMenu = debugMainMenu;
window.forceHideMenu = forceHideMenu;
window.forceShowMenu = forceShowMenu;
window.testMenuNavigation = testMenuNavigation;
window.testFullNavigation = testFullNavigation;

// Debug automático removido para evitar conflito com o menu principal
// Use createDebugPanel() no console para abrir o painel de debug quando necessário
console.log('💡 Digite createDebugPanel() no console para abrir o painel de debug'); 