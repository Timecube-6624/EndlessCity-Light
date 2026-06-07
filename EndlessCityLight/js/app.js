// app.js - 主应用逻辑模块

// 当前政策标签
let currentTab = 'tax';

// 地图选择相关元素 - 延迟初始化
let setupMap = null;
let mapMarker = null;
let inputLng = null;
let inputLat = null;

/**
 * 初始化DOM元素引用
 */
function initDOMElements() {
    setupMap = document.getElementById('setupMap');
    mapMarker = document.getElementById('mapMarker');
    inputLng = document.getElementById('inputLng');
    inputLat = document.getElementById('inputLat');
}

/**
 * 初始化游戏
 */
function initGame() {
    // 先初始化DOM元素引用
    initDOMElements();
    
    // 初始化地图事件监听器
    initMapEvents();
    
    // 检查存档
    const saved = localStorage.getItem('citySimEconomy');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.gameStarted) {
                Game.state = { ...Game.defaultState, ...parsed };
                document.getElementById('setupOverlay').style.display = 'none';
                if (inputLng) inputLng.value = Game.state.longitude;
                if (inputLat) inputLat.value = Game.state.latitude;
            }
        } catch (e) {
            console.warn('存档损坏');
        }
    }
    
    // 初始化UI
    Policies.renderSliders(currentTab);
    UI.updateDisplay();
    UI.updateZoneDisplay();
    updatePreview();
}

/**
 * 更新地图标记
 */
function updateMapMarker(lng, lat) {
    if (!mapMarker) return;
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    mapMarker.style.left = `${x}%`;
    mapMarker.style.top = `${y}%`;
}

/**
 * 更新预览信息
 */
function updatePreview() {
    const lng = inputLng ? parseFloat(inputLng.value) : 116.4;
    const lat = inputLat ? parseFloat(inputLat.value) : 39.9;
    
    const timezoneEl = document.getElementById('previewTimezone');
    const sunriseEl = document.getElementById('previewSunrise');
    const sunsetEl = document.getElementById('previewSunset');
    const daylightEl = document.getElementById('previewDaylight');
    
    if (timezoneEl) timezoneEl.textContent = Astronomy.getTimezone(lng);
    
    if (sunriseEl || sunsetEl || daylightEl) {
        const sunTimes = Astronomy.calculateSunTimes(lat, lng, 6, 15);
        if (sunriseEl) sunriseEl.textContent = sunTimes.sunrise;
        if (sunsetEl) sunsetEl.textContent = sunTimes.sunset;
        if (daylightEl) daylightEl.textContent = sunTimes.daylight;
    }
    
    updateMapMarker(lng || 0, lat || 0);
}

/**
 * 开始游戏
 */
function startGame() {
    // 确保DOM元素已初始化
    if (!inputLng || !inputLat) {
        initDOMElements();
    }
    
    const lngValue = inputLng ? parseFloat(inputLng.value) : 116.4;
    const latValue = inputLat ? parseFloat(inputLat.value) : 39.9;
    
    Game.state.longitude = lngValue || 116.4;
    Game.state.latitude = latValue || 39.9;
    Game.state.gameStarted = true;
    
    document.getElementById('setupOverlay').style.display = 'none';
    Game.addLog(`城市坐标: ${Game.state.latitude.toFixed(1)}°N, ${Game.state.longitude.toFixed(1)}°E`, 'success');
    
    updatePreview();
    UI.updateDisplay();
    
    // 保存游戏状态
    saveGame();
}

/**
 * 保存游戏状态
 */
function saveGame() {
    try {
        localStorage.setItem('citySimEconomy', JSON.stringify(Game.state));
    } catch (e) {
        console.warn('保存失败:', e);
    }
}

/**
 * 切换时间播放
 */
function toggleTime() {
    Game.state.isPlaying = !Game.state.isPlaying;
    document.getElementById('playBtn').textContent = Game.state.isPlaying ? '❚❚' : '▶';
    
    if (Game.state.isPlaying) {
        // 根据速度设置定时器间隔
        // speed=1: 1秒推进30分钟
        // speed=0.5: 2秒推进30分钟（变慢）
        // speed=100: 10ms推进30分钟（变快）
        const interval = Math.max(10, 1000 / Game.state.speed);
        
        // 确保先清除旧的定时器
        if (Game.state.autoTimer) {
            clearInterval(Game.state.autoTimer);
        }
        
        Game.state.autoTimer = setInterval(() => {
            try {
                Game.simulateTime();
            } catch (error) {
                console.error('simulateTime in interval error:', error);
                // 如果出错，停止定时器
                clearInterval(Game.state.autoTimer);
                Game.state.isPlaying = false;
                document.getElementById('playBtn').textContent = '▶';
            }
        }, interval);
        
        console.log(`Timer started with interval: ${interval}ms`);
    } else {
        if (Game.state.autoTimer) {
            clearInterval(Game.state.autoTimer);
            Game.state.autoTimer = null;
            console.log('Timer stopped');
        }
    }
}

/**
 * 设置速度
 */
function setSpeed(speed) {
    Game.state.speed = speed;
    
    document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // 显示正确的时间倍率信息
    const minutesPerSecond = (30 * speed).toFixed(1);
    document.getElementById('timeInfo').textContent = `1秒 = ${minutesPerSecond}分钟`;
    
    if (Game.state.isPlaying) {
        clearInterval(Game.state.autoTimer);
        const interval = Math.max(10, 1000 / speed);
        Game.state.autoTimer = setInterval(Game.simulateTime, interval);
    }
}

/**
 * 更新预算分配
 */
function updateBudget(category, value) {
    const state = Game.state;
    const numValue = parseInt(value);
    
    switch(category) {
        case 'infrastructure':
            state.budget.infrastructure = numValue;
            document.getElementById('budgetInfraAmount').textContent = numValue.toLocaleString();
            break;
        case 'education':
            state.budget.education = numValue;
            document.getElementById('budgetEduAmount').textContent = numValue.toLocaleString();
            break;
        case 'healthcare':
            state.budget.healthcare = numValue;
            document.getElementById('budgetHealthAmount').textContent = numValue.toLocaleString();
            break;
        case 'publicSafety':
            state.budget.publicSafety = numValue;
            document.getElementById('budgetSafetyAmount').textContent = numValue.toLocaleString();
            break;
        case 'environment':
            state.budget.environment = numValue;
            document.getElementById('budgetEnvAmount').textContent = numValue.toLocaleString();
            break;
        case 'socialWelfare':
            state.budget.socialWelfare = numValue;
            document.getElementById('budgetWelfareAmount').textContent = numValue.toLocaleString();
            break;
    }
    
    // 更新总预算
    state.budget.total = state.budget.infrastructure + state.budget.education + 
                        state.budget.healthcare + state.budget.publicSafety + 
                        state.budget.environment + state.budget.socialWelfare;
    document.getElementById('budgetTotal').textContent = state.budget.total.toLocaleString();
    
    // 更新财政显示（预算变化影响财政）
    UI.updateFinanceDisplay();
    UI.updateHeroDisplay();
}

/**
 * 保存游戏
 */
function saveGame() {
    localStorage.setItem('citySimEconomy', JSON.stringify(Game.state));
    Game.addLog('游戏已保存', 'success');
}

/**
 * 读取游戏
 */
function loadGame() {
    const saved = localStorage.getItem('citySimEconomy');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (typeof parsed.population === 'number' && !isNaN(parsed.population)) {
                Game.state = { ...Game.defaultState, ...parsed };
                
                if (Game.state.isPlaying) {
                    clearInterval(Game.state.autoTimer);
                    Game.state.isPlaying = false;
                    document.getElementById('playBtn').textContent = '▶';
                }
                
                Game.addLog('游戏已读取', 'success');
                UI.updateDisplay();
                Policies.renderSliders(currentTab);
                
                inputLng.value = Game.state.longitude;
                inputLat.value = Game.state.latitude;
                updatePreview();
            }
        } catch (e) {
            Game.addLog('读取失败，存档可能已损坏', 'warning');
        }
    } else {
        Game.addLog('未找到存档', 'warning');
    }
}

/**
 * 重置游戏
 */
function resetGame() {
    if (confirm('确定要重置游戏吗？所有进度将丢失。')) {
        clearInterval(Game.state.autoTimer);
        Game.state = JSON.parse(JSON.stringify(Game.defaultState));
        Game.state.gameStarted = true;
        
        localStorage.removeItem('citySimEconomy');
        Game.addLog('游戏已重置', 'success');
        
        UI.updateDisplay();
        Policies.renderSliders(currentTab);
        
        document.getElementById('playBtn').textContent = '▶';
        inputLng.value = Game.state.longitude;
        inputLat.value = Game.state.latitude;
        updatePreview();
    }
}

/**
 * 初始化地图事件监听器
 */
function initMapEvents() {
    if (setupMap) {
        setupMap.addEventListener('click', (e) => {
            const rect = setupMap.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            const lng = (x * 360) - 180;
            const lat = 90 - (y * 180);
            
            if (inputLng) inputLng.value = lng.toFixed(1);
            if (inputLat) inputLat.value = lat.toFixed(1);
            updatePreview();
        });
    }
    
    if (inputLng) {
        inputLng.addEventListener('input', updatePreview);
    }
    if (inputLat) {
        inputLat.addEventListener('input', updatePreview);
    }
}

// 暴露全局函数（供HTML调用）
window.startGame = startGame;
window.toggleTime = toggleTime;
window.setSpeed = setSpeed;
window.saveGame = saveGame;
window.loadGame = loadGame;
window.resetGame = resetGame;
window.switchView = UI.switchView;
window.closePanel = UI.closePanel;
window.openModal = UI.openModal;
window.closeModal = UI.closeModal;
window.toggleTheme = UI.toggleTheme;
window.switchTab = UI.switchTab;
window.switchSettingsTab = UI.switchSettingsTab;
window.applySettings = UI.applySettings;
window.resetSettings = UI.resetSettings;
window.updateSlider = Policies.updateSlider;

/**
 * 运行财政模块测试
 */
function runFinanceTest() {
    const testState = JSON.parse(JSON.stringify(Game.defaultState));
    const result = Finance.validateFinanceCalculation(testState);
    
    console.log('=== 财政模块测试报告 ===');
    console.log('当前状态:', {
        money: result.state.money,
        baseIncome: result.state.baseIncome,
        baseExpense: result.state.baseExpense,
        budgetTotal: result.state.budgetTotal
    });
    console.log('\n收入明细:', result.income);
    console.log('\n支出明细:', result.expense);
    console.log('\n月度结余:', result.balance.balance);
    console.log('\n验证结果:', result.validation);
    
    // 运行3个月模拟
    const simResult = Finance.runFinanceSimulation(testState, 3);
    console.log('\n=== 3个月模拟测试 ===');
    console.log('初始资金:', simResult.initialMoney);
    console.log('最终资金:', simResult.finalMoney);
    console.log('预期变化:', simResult.expectedChange);
    console.log('实际变化:', simResult.actualChange);
    console.log('月度明细:', simResult.monthlyResults);
    
    return result;
}

/**
 * 打印财政摘要
 */
function printFinanceSummary() {
    const finance = Finance.calculateMonthlyBalance(Game.state);
    console.log('=== 财政摘要 ===');
    console.log('收入总计:', finance.income.totalIncome);
    console.log('支出总计:', finance.expense.totalExpense);
    console.log('月度结余:', finance.balance);
    console.log('每日结余:', finance.balancePerDay);
}

// 暴露测试函数到全局
window.runFinanceTest = runFinanceTest;
window.printFinanceSummary = printFinanceSummary;
window.Finance = Finance;

// 启动游戏
initGame();