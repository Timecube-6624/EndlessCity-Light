// ui.js - UI渲染模块

/**
 * 更新所有显示
 */
function updateDisplay() {
    updateTimeDisplay();
    updateHeroDisplay();
    updateFinanceDisplay();
    updateZoneDisplay();
    updatePopulationDisplay();
    updateSectorDisplay();
    updateDemandDisplay();
    updateStatsDisplay();
    updatePowerDisplay();
    updateConstructionDisplay();
    
    // 如果外部链接面板已打开，更新它
    const linksPanel = document.getElementById('linksPanel');
    if (linksPanel && linksPanel.classList.contains('active')) {
        updateLinksPanel();
    }
    
    // 如果服务设施面板已打开，更新它
    const facilitiesPanel = document.getElementById('facilitiesPanel');
    if (facilitiesPanel && facilitiesPanel.classList.contains('active')) {
        updateFacilitiesPanel();
    }
    
    // 监控能源状态
    if (typeof Game !== 'undefined' && Game.monitorEnergyStatus) {
        Game.monitorEnergyStatus();
    }
}

/**
 * 更新时间显示
 */
function updateTimeDisplay() {
    const state = Game.state;
    
    // 确保时间值在有效范围内
    const hour = Math.max(0, Math.min(23, Math.floor(state.hour)));
    const minute = Math.max(0, Math.min(59, Math.floor(state.minute)));
    const daysInMonth = typeof Game.getDaysInMonth === 'function' ? Game.getDaysInMonth(state.month) : 30;
    const day = Math.max(1, Math.min(daysInMonth, Math.floor(state.day)));
    const month = Math.max(1, Math.min(12, Math.floor(state.month)));
    
    // 日期时间
    document.getElementById('timeDate').textContent = `第${state.year}年 ${month}月${day}日`;
    document.getElementById('timeClock').textContent = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    document.getElementById('timeSeason').textContent = Astronomy.getSeason(month, state.latitude);
    
    // 日出日落
    const sunTimes = Astronomy.calculateSunTimes(state.latitude, state.longitude, month, day);
    document.getElementById('sunriseTime').textContent = sunTimes.sunrise;
    document.getElementById('sunsetTime').textContent = sunTimes.sunset;
    
    // 日出日落图标状态
    const isDay = Astronomy.isDaytime(hour, sunTimes);
    document.getElementById('sunriseIcon').style.opacity = isDay ? 1 : 0.3;
    document.getElementById('sunsetIcon').style.opacity = isDay ? 0.3 : 1;
    
    // 计算日出日落渐变状态
    updateSunGradient(state, sunTimes);
}

/**
 * 更新日出日落渐变动画（使用CSS变量实现平滑过渡）
 */
function updateSunGradient(state, sunTimes) {
    const gradientEl = document.getElementById('sunGradient');
    const headerEl = document.querySelector('.header');
    if (!gradientEl || !headerEl) return;
    
    // 速度过快时（speed > 10），固定顶栏为黑色
    // 避免快速切换导致的颜色闪烁
    if (state.speed > 10) {
        const darkColors = ['#0a0a0a', '#0d0d0d', '#111111', '#141414'];
        headerEl.style.setProperty('--header-color-1', darkColors[0]);
        headerEl.style.setProperty('--header-color-2', darkColors[1]);
        headerEl.style.setProperty('--header-color-3', darkColors[2]);
        headerEl.style.setProperty('--header-color-4', darkColors[3]);
        gradientEl.style.background = `linear-gradient(to top, ${darkColors.join(', ')})`;
        return;
    }
    
    // 解析日出日落时间
    const sunriseParts = sunTimes.sunrise.split(':');
    const sunsetParts = sunTimes.sunset.split(':');
    const sunriseHour = parseInt(sunriseParts[0]);
    const sunriseMin = parseInt(sunriseParts[1]);
    const sunsetHour = parseInt(sunsetParts[0]);
    const sunsetMin = parseInt(sunsetParts[1]);
    
    // 计算当前时间（分钟）
    const currentMin = state.hour * 60 + state.minute;
    const sunriseMinTotal = sunriseHour * 60 + sunriseMin;
    const sunsetMinTotal = sunsetHour * 60 + sunsetMin;
    
    // 日出前1.5小时到日出后1.5小时为日出阶段（更宽的过渡带）
    // 日落前1.5小时到日落后1.5小时为日落阶段
    const sunriseStart = sunriseMinTotal - 90;
    const sunriseEnd = sunriseMinTotal + 90;
    const sunsetStart = sunsetMinTotal - 90;
    const sunsetEnd = sunsetMinTotal + 90;
    
    // 定义各时段的颜色配置（4色渐变，从下到上）
    const timeColors = {
        night: ['#050510', '#0a0a1a', '#0f1429', '#1a1a3e'],
        sunrise: ['#0a0a1a', '#1a1a2e', '#ff7b00', '#87ceeb'],
        day: ['#1a1a2e', '#16213e', '#0f3460', '#533483'],
        sunset: ['#1a1a2e', '#dc143c', '#ff6347', '#ffa500']
    };
    
    let colors;
    
    if (currentMin >= sunriseStart && currentMin < sunriseEnd) {
        // 日出过渡阶段 - 平滑混合夜晚到日出颜色
        const progress = (currentMin - sunriseStart) / (sunriseEnd - sunriseStart);
        colors = blendColorArrays(timeColors.night, timeColors.sunrise, progress);
    } else if (currentMin >= sunriseEnd && currentMin < sunsetStart) {
        // 白天
        colors = timeColors.day;
    } else if (currentMin >= sunsetStart && currentMin < sunsetEnd) {
        // 日落过渡阶段 - 平滑混合白天到日落颜色
        const progress = (currentMin - sunsetStart) / (sunsetEnd - sunsetStart);
        colors = blendColorArrays(timeColors.day, timeColors.sunset, progress);
    } else {
        // 夜晚
        colors = timeColors.night;
    }
    
    // 设置CSS变量实现平滑过渡
    headerEl.style.setProperty('--header-color-1', colors[0]);
    headerEl.style.setProperty('--header-color-2', colors[1]);
    headerEl.style.setProperty('--header-color-3', colors[2]);
    headerEl.style.setProperty('--header-color-4', colors[3]);
    
    // 更新小太阳渐变指示器
    gradientEl.style.background = `linear-gradient(to top, ${colors.join(', ')})`;
}

/**
 * 混合两个颜色数组
 */
function blendColorArrays(colors1, colors2, progress) {
    return colors1.map((color1, index) => {
        const color2 = colors2[index];
        return blendColors(color1, color2, progress);
    });
}

/**
 * 混合两个十六进制颜色
 */
function blendColors(color1, color2, progress) {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * 更新核心数据显示
 */
function updateHeroDisplay() {
    const state = Game.state;
    
    document.getElementById('year').textContent = state.year;
    document.getElementById('population').textContent = Math.round(state.population + state.tourists).toLocaleString();
    document.getElementById('popDetail').textContent = `${Math.round(state.population).toLocaleString()}+${state.tourists}游客`;
    document.getElementById('money').textContent = Math.round(state.money).toLocaleString();
    document.getElementById('happiness').textContent = Math.round(state.happiness);
    document.getElementById('gdp').textContent = Math.round(state.gdp).toLocaleString();
    
    // 增长率显示：整数加粗，小数变小
    const growthSign = state.growth > 0 ? '+' : '';
    const growthInt = Math.floor(Math.abs(state.growth));
    const growthDec = Math.round((Math.abs(state.growth) - growthInt) * 10);
    document.getElementById('growth').innerHTML = `${growthSign}<span class="integer">${growthInt}</span><span class="decimal">.${growthDec}</span><span class="decimal">%</span>`;
    
    // 使用Finance模块计算收支
    const finance = Finance.calculateMonthlyBalance(state);
    document.getElementById('moneyChange').textContent = (finance.balance >= 0 ? '+' : '') + Math.round(finance.balance).toLocaleString() + '/月';
    document.getElementById('gdpChange').textContent = (state.growth > 0 ? '+' : '') + state.growth.toFixed(1) + '%';
    
    // 幸福趋势
    if (state.happiness > 80) {
        document.getElementById('happyTrend').textContent = '↑上升';
        document.getElementById('happyTrend').style.color = 'var(--positive)';
    } else if (state.happiness < 50) {
        document.getElementById('happyTrend').textContent = '↓下降';
        document.getElementById('happyTrend').style.color = 'var(--negative)';
    } else {
        document.getElementById('happyTrend').textContent = '→稳定';
        document.getElementById('happyTrend').style.color = 'var(--text-muted)';
    }
}

/**
 * 更新财政明细显示
 */
function updateFinanceDisplay() {
    const state = Game.state;
    const finance = Finance.calculateMonthlyBalance(state);
    
    // 更新结余
    const balanceEl = document.getElementById('financeBalance');
    if (balanceEl) {
        const balanceText = (finance.balance >= 0 ? '+' : '') + Math.round(finance.balance).toLocaleString();
        balanceEl.textContent = balanceText;
        balanceEl.className = 'finance-total-value' + (finance.balance < 0 ? ' negative' : '');
    }
    
    // 更新收支总额
    const totalIncomeEl = document.getElementById('financeTotalIncome');
    const totalExpenseEl = document.getElementById('financeTotalExpense');
    if (totalIncomeEl) totalIncomeEl.textContent = Math.round(finance.income.totalIncome).toLocaleString();
    if (totalExpenseEl) totalExpenseEl.textContent = Math.round(finance.expense.totalExpense).toLocaleString();
    
    // 更新收支比例条
    const incomeBar = document.getElementById('financeIncomeBar');
    const expenseBar = document.getElementById('financeExpenseBar');
    if (incomeBar && expenseBar) {
        const total = finance.income.totalIncome + finance.expense.totalExpense;
        if (total > 0) {
            incomeBar.style.width = (finance.income.totalIncome / total * 100) + '%';
            expenseBar.style.width = (finance.expense.totalExpense / total * 100) + '%';
        }
    }
    
    // 更新收入明细
    document.getElementById('incomeBase').textContent = Math.round(finance.income.baseIncome).toLocaleString();
    
    // 更新工业细分税收显示
    const totalIndustryTax = (finance.income.manufacturingTax || 0) + (finance.income.heavyIndustryTax || 0) + (finance.income.hiTechTax || 0);
    document.getElementById('incomeIndustry').textContent = Math.round(totalIndustryTax).toLocaleString();
    
    // 如果有细分数据，显示明细
    if (document.getElementById('incomeManufacturing')) {
        document.getElementById('incomeManufacturing').textContent = Math.round(finance.income.manufacturingTax || 0).toLocaleString();
    }
    if (document.getElementById('incomeHeavyIndustry')) {
        document.getElementById('incomeHeavyIndustry').textContent = Math.round(finance.income.heavyIndustryTax || 0).toLocaleString();
    }
    if (document.getElementById('incomeHiTech')) {
        document.getElementById('incomeHiTech').textContent = Math.round(finance.income.hiTechTax || 0).toLocaleString();
    }
    
    document.getElementById('incomeCommerce').textContent = Math.round(finance.income.commerceTax).toLocaleString();
    document.getElementById('incomeResidential').textContent = Math.round(finance.income.residentialTax).toLocaleString();
    document.getElementById('incomeOffice').textContent = Math.round(finance.income.officeTax).toLocaleString();
    document.getElementById('incomeTrade').textContent = Math.round(finance.income.tradeIncome).toLocaleString();
    document.getElementById('incomeTourism').textContent = Math.round(finance.income.tourismIncome).toLocaleString();
    
    // 更新支出明细
    document.getElementById('expenseBase').textContent = Math.round(finance.expense.baseExpense).toLocaleString();
    document.getElementById('expenseWelfare').textContent = Math.round(finance.expense.welfareExpense).toLocaleString();
    document.getElementById('expenseBudget').textContent = Math.round(finance.expense.infraExpense).toLocaleString();
    document.getElementById('expenseHealthcare').textContent = Math.round(finance.expense.healthcareExpense).toLocaleString();
    document.getElementById('expenseEducation').textContent = Math.round(finance.expense.educationExpense).toLocaleString();
    document.getElementById('expenseEnergy').textContent = Math.round(finance.expense.energyPurchaseExpense).toLocaleString();
}

/**
 * 更新城市功能区显示
 */
function updateZoneDisplay() {
    const state = Game.state;
    const pv = state.policyValues;
    const zoneBars = document.getElementById('zoneBars');
    
    if (!zoneBars) return;
    
    // 根据政策值实时计算功能区占比
    const baseZones = { ...state.zones };
    
    // 计算总住宅区占比（将各密度住宅区相加）
    const res = baseZones.residential;
    const totalResidential = res.lowDensity + res.mediumDensity + res.highDensity + res.skyscraper;
    
    // 绿地：基础值 + 绿化政策影响
    const greenValue = Math.min(40, Math.max(5, baseZones.green + (pv.greenCity - 30) * 0.3));
    // 工业：基础值 - 绿化影响 + 道路建设影响
    const industrialValue = Math.min(50, Math.max(10, baseZones.industrial - (pv.greenCity - 30) * 0.15 + (pv.roadBuild - 20) * 0.08));
    // 商业：基础值 + 贸易开放度影响
    const commercialValue = Math.min(40, Math.max(10, baseZones.commercial + (pv.tradeOpen - 30) * 0.15));
    // 住宅：基础值 + 住房建设影响
    const residentialValue = Math.min(60, Math.max(20, totalResidential + (pv.housing - 25) * 0.2));
    // 公共设施：基础值 + 医疗和教育影响
    const publicValue = Math.min(25, Math.max(5, baseZones.public + ((pv.healthcare + pv.educationInvest) - 90) * 0.05));
    
    // 归一化确保总和为100
    const total = residentialValue + commercialValue + industrialValue + greenValue + publicValue;
    const scale = total > 0 ? 100 / total : 1;
    
    const zones = {
        residential: Math.round(residentialValue * scale),
        commercial: Math.round(commercialValue * scale),
        industrial: Math.round(industrialValue * scale),
        green: Math.round(greenValue * scale),
        public: 100 - Math.round(residentialValue * scale) - Math.round(commercialValue * scale) - Math.round(industrialValue * scale) - Math.round(greenValue * scale)
    };
    
    const items = zoneBars.querySelectorAll('.zone-bar-item');
    const keys = ['residential', 'commercial', 'industrial', 'public', 'green'];
    
    items.forEach((item, i) => {
        const value = zones[keys[i]];
        item.querySelector('.zone-fill').style.width = value + '%';
        item.querySelector('.zone-value').textContent = value + '%';
    });
}

/**
 * 更新人口结构显示
 */
function updatePopulationDisplay() {
    const state = Game.state;
    const total = state.population || 1;
    
    // 计算人口结构比例
    const workerRatio = state.workers / total;
    const elderRatio = state.elders / total;
    const childRatio = state.children / total;
    
    // 常住人口总和（应接近100%）
    const residentSum = workerRatio + elderRatio + childRatio;
    
    // 如果总和不等于100%，进行归一化调整
    let workerPercent, elderPercent, childPercent;
    if (residentSum > 0) {
        workerPercent = (workerRatio / residentSum) * 100;
        elderPercent = (elderRatio / residentSum) * 100;
        childPercent = (childRatio / residentSum) * 100;
    } else {
        workerPercent = elderPercent = childPercent = 0;
    }
    
    // 更新常住人口结构
    document.getElementById('workerBar').style.width = workerPercent + '%';
    document.getElementById('elderBar').style.width = elderPercent + '%';
    document.getElementById('childBar').style.width = childPercent + '%';
    
    // 游客作为独立群体，使用相对比例显示（最多显示为人口的10%）
    const touristRatio = Math.min(10, Math.max(0, state.tourists / total * 100));
    document.getElementById('touristBar').style.width = touristRatio + '%';
    
    // 更新数值显示
    document.getElementById('workerCount').textContent = state.workers.toLocaleString();
    document.getElementById('elderCount').textContent = state.elders.toLocaleString();
    document.getElementById('childCount').textContent = state.children.toLocaleString();
    document.getElementById('touristCount').textContent = state.tourists.toLocaleString();
    
    // 更新劳动力市场信息（如果存在显示元素）
    if (document.getElementById('laborForceCount')) {
        document.getElementById('laborForceCount').textContent = (state.laborMarket?.totalLaborForce || 0).toLocaleString();
    }
    if (document.getElementById('unemploymentRate')) {
        document.getElementById('unemploymentRate').textContent = (state.unemployedRate || 0).toFixed(1) + '%';
    }
    if (document.getElementById('industryEmploymentCount')) {
        document.getElementById('industryEmploymentCount').textContent = (state.industryEmployment?.total || 0).toLocaleString();
    }
    if (document.getElementById('industryEmploymentRatio')) {
        document.getElementById('industryEmploymentRatio').textContent = (state.industryEmployment?.ratio || 0).toFixed(1) + '%';
    }
}

/**
 * 更新产业板块显示
 */
function updateSectorDisplay() {
    const state = Game.state;
    
    // 更新工业细分显示
    const industry = state.industry;
    if (typeof industry === 'object') {
        // 获取工业细分数据
        const manufacturing = Math.max(0, Math.round(industry.manufacturing || 0));
        const heavyIndustry = Math.max(0, Math.round(industry.heavyIndustry || 0));
        const hiTech = Math.max(0, Math.round(industry.hiTech || 0));
        
        // 计算工业细分总和并进行归一化
        const industrySum = manufacturing + heavyIndustry + hiTech;
        
        // 归一化处理：确保各细分比例总和为100%
        let normManufacturing, normHeavyIndustry, normHiTech;
        if (industrySum > 0) {
            normManufacturing = (manufacturing / industrySum) * 100;
            normHeavyIndustry = (heavyIndustry / industrySum) * 100;
            normHiTech = (hiTech / industrySum) * 100;
        } else {
            normManufacturing = normHeavyIndustry = normHiTech = 0;
        }
        
        // 更新工业总览（显示实际总和或100，取较小值）
        const displayIndustry = Math.min(100, industrySum);
        document.getElementById('industryBar').style.width = displayIndustry + '%';
        document.getElementById('industryValue').textContent = displayIndustry;
        
        // 如果有细分元素则更新（使用归一化后的百分比）
        if (document.getElementById('manufacturingBar')) {
            document.getElementById('manufacturingBar').style.width = normManufacturing + '%';
            document.getElementById('manufacturingValue').textContent = manufacturing;
        }
        if (document.getElementById('heavyIndustryBar')) {
            document.getElementById('heavyIndustryBar').style.width = normHeavyIndustry + '%';
            document.getElementById('heavyIndustryValue').textContent = heavyIndustry;
        }
        if (document.getElementById('hiTechBar')) {
            document.getElementById('hiTechBar').style.width = normHiTech + '%';
            document.getElementById('hiTechValue').textContent = hiTech;
        }
        
        // 更新工业就业人口显示（如果存在元素）
        if (state.industryEmployment) {
            if (document.getElementById('manufacturingWorkers')) {
                document.getElementById('manufacturingWorkers').textContent = state.industryEmployment.manufacturing.toLocaleString();
            }
            if (document.getElementById('heavyIndustryWorkers')) {
                document.getElementById('heavyIndustryWorkers').textContent = state.industryEmployment.heavyIndustry.toLocaleString();
            }
            if (document.getElementById('hiTechWorkers')) {
                document.getElementById('hiTechWorkers').textContent = state.industryEmployment.hiTech.toLocaleString();
            }
            if (document.getElementById('totalIndustryWorkers')) {
                document.getElementById('totalIndustryWorkers').textContent = state.industryEmployment.total.toLocaleString();
            }
        }
        
        // 更新技术进步和自动化显示（如果存在元素）
        if (state.technology) {
            if (document.getElementById('automationLevel')) {
                document.getElementById('automationLevel').textContent = Math.round(state.technology.automationLevel) + '%';
            }
            if (document.getElementById('laborProductivity')) {
                document.getElementById('laborProductivity').textContent = state.technology.laborProductivity.toFixed(2) + 'x';
            }
        }
    } else {
        // 兼容旧格式
        const value = Math.min(100, Math.max(0, Math.round(industry)));
        document.getElementById('industryBar').style.width = value + '%';
        document.getElementById('industryValue').textContent = value;
    }
    
    // 更新其他产业（确保不超过100）
    const otherSectors = ['commerce', 'service', 'agriculture', 'tourism'];
    otherSectors.forEach(sector => {
        const value = Math.min(100, Math.max(0, Math.round(state[sector])));
        document.getElementById(`${sector}Bar`).style.width = value + '%';
        document.getElementById(`${sector}Value`).textContent = value;
    });
}

/**
 * 更新城市需求显示
 */
function updateDemandDisplay() {
    const state = Game.state;
    
    document.getElementById('basicDemand').textContent = Math.round(state.basicDemand) + '%';
    document.getElementById('developDemand').textContent = Math.round(state.developDemand) + '%';
    document.getElementById('leisureDemand').textContent = Math.round(state.leisureDemand) + '%';
}

/**
 * 更新城市指标显示
 */
function updateStatsDisplay() {
    const state = Game.state;
    
    document.getElementById('education').textContent = Math.round(state.education);
    document.getElementById('health').textContent = Math.round(state.health);
    document.getElementById('environment').textContent = Math.round(state.environment);
    document.getElementById('safety').textContent = Math.round(state.safety);
}

/**
 * 切换视图
 */
function switchView(view) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    // 关闭所有弹窗
    closeModal('settings');
    closeModal('about');
    closeModal('links');
    closeModal('facilities');
    
    // 切换主内容视图
    if (view === 'sim' || view === 'data') {
        document.querySelector('.left-panel').style.display = 'flex';
        document.querySelector('.right-sidebar').style.display = 'flex';
    }
}

/**
 * 打开弹窗
 */
function openModal(modalName) {
    const modal = document.getElementById(`${modalName}Modal`);
    if (modal) {
        modal.classList.add('active');
        
        // 更新面板内容
        if (modalName === 'links') {
            updateLinksPanel();
        } else if (modalName === 'facilities') {
            updateFacilitiesPanel();
        } else if (modalName === 'settings') {
            syncSettingsInputs();
        }
    }
}

/**
 * 关闭弹窗
 */
function closeModal(modalName) {
    const modal = document.getElementById(`${modalName}Modal`);
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * 关闭所有面板
 */
function closeAllPanels() {
    closeModal('settings');
    closeModal('about');
    closeModal('links');
    closeModal('facilities');
    document.getElementById('overlay').classList.remove('active');
    
    // 重置导航按钮状态
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const simBtn = document.querySelector('.nav-btn[onclick*="sim"]');
    if (simBtn) simBtn.classList.add('active');
}

/**
 * 更新外部链接面板
 */
function updateLinksPanel() {
    const links = Game.state.externalLinks;
    
    // 更新概览统计
    let totalCapacity = 0;
    let totalUsers = 0;
    let totalRevenue = 0;
    let totalMaintenance = 0;
    
    const linkTypes = ['highway', 'rail', 'air', 'shipping'];
    
    linkTypes.forEach(type => {
        const link = links[type];
        if (!link) return;
        
        const owned = link.owned;
        totalCapacity += owned * link.capacity;
        totalUsers += link.monthlyUsers;
        totalRevenue += link.monthlyRevenue;
        totalMaintenance += owned * link.maintenanceCost;
        
        // 更新单个链接显示
        document.getElementById(`link${type.charAt(0).toUpperCase() + type.slice(1)}Count`).textContent = owned;
        document.getElementById(`link${type.charAt(0).toUpperCase() + type.slice(1)}Capacity`).textContent = owned * link.capacity;
        
        // 更新使用率条
        document.getElementById(`link${type.charAt(0).toUpperCase() + type.slice(1)}Usage`).style.width = (link.usageRate * 100) + '%';
        
        // 更新统计
        document.getElementById(`link${type.charAt(0).toUpperCase() + type.slice(1)}Users`).textContent = link.monthlyUsers.toLocaleString();
        document.getElementById(`link${type.charAt(0).toUpperCase() + type.slice(1)}Revenue`).textContent = Math.round(link.monthlyRevenue).toLocaleString();
        document.getElementById(`link${type.charAt(0).toUpperCase() + type.slice(1)}Maintenance`).textContent = (owned * link.maintenanceCost).toLocaleString();
        
        // 更新价格输入
        const ticketInput = document.getElementById(`edit${type.charAt(0).toUpperCase() + type.slice(1)}Ticket`);
        const tollInput = document.getElementById(`edit${type.charAt(0).toUpperCase() + type.slice(1)}Toll`);
        
        if (ticketInput && ticketInput.value != link.ticketPrice) {
            ticketInput.value = link.ticketPrice;
        }
        if (tollInput && tollInput.value != link.tollFee) {
            tollInput.value = link.tollFee;
        }
    });
    
    // 更新概览
    document.getElementById('linksTotalCapacity').textContent = totalCapacity;
    document.getElementById('linksTotalUsers').textContent = totalUsers.toLocaleString();
    document.getElementById('linksTotalRevenue').textContent = Math.round(totalRevenue).toLocaleString();
    document.getElementById('linksTotalMaintenance').textContent = totalMaintenance.toLocaleString();
    
    // 更新净收益
    const netProfit = totalRevenue - totalMaintenance;
    const profitElement = document.getElementById('linksNetProfit');
    profitElement.textContent = (netProfit >= 0 ? '+' : '') + Math.round(netProfit).toLocaleString();
    profitElement.style.color = netProfit >= 0 ? 'var(--positive)' : 'var(--negative)';
}

/**
 * 购买外部链接（面板调用）
 */
function purchaseLink(type) {
    const success = Game.buyExternalLink(type);
    if (success) {
        updateLinksPanel();
        updateDisplay();
    }
}

/**
 * 更新链接价格（面板调用）
 */
function updateLinkPrice(type, priceType, value) {
    Game.setLinkPrice(type, priceType, parseInt(value));
}

/**
 * 关闭面板（兼容旧代码）
 */
function closePanel(panel) {
    closeModal(panel);
}

/**
 * 更新服务设施面板
 */
function updateFacilitiesPanel() {
    updateEnergyOverview();
    renderFacilitiesList('power');
    updateFinanceReport();
}

/**
 * 更新能源概览
 */
function updateEnergyOverview() {
    const power = Game.state.powerGeneration;
    const alert = Game.state.energyAlert;
    
    // 更新能源数值
    document.getElementById('energySupply').textContent = power.total;
    document.getElementById('energyConsumption').textContent = power.consumption;
    
    const balance = power.total - power.consumption;
    document.getElementById('energyBalance').textContent = balance;
    document.getElementById('energyBalance').style.color = balance >= 0 ? 'var(--positive)' : 'var(--negative)';
    
    // 更新能源效率
    const efficiency = power.total > 0 ? Math.round((power.total - Math.max(0, -balance)) / power.total * 100) : 100;
    document.getElementById('energyEfficiency').textContent = efficiency + '%';
    
    // 更新警报级别
    const alertText = ['正常', '⚠️ 警告', '⚡ 严重', '🔥 危急'];
    const alertEl = document.getElementById('energyAlertLevel');
    alertEl.textContent = alertText[alert.level];
    
    // 根据警报级别设置样式类
    alertEl.classList.remove('warning', 'critical');
    if (alert.level >= 2) {
        alertEl.classList.add('critical');
    } else if (alert.level === 1) {
        alertEl.classList.add('warning');
    }
    
    // 更新仪表
    const gaugePercent = power.consumption > 0 ? Math.min(100, (power.total / power.consumption) * 100) : 100;
    const gaugeFill = document.getElementById('energyGaugeFill');
    gaugeFill.style.width = gaugePercent + '%';
    
    // 根据警报级别设置仪表颜色
    if (alert.level >= 2) {
        gaugeFill.style.background = 'var(--negative)';
    } else if (alert.level === 1) {
        gaugeFill.style.background = 'var(--warning)';
    } else {
        gaugeFill.style.background = 'var(--positive)';
    }
    
    // 能源预警视觉效果
    if (alert.level >= 1) {
        alertEl.classList.add('blink');
    } else {
        alertEl.classList.remove('blink');
    }
}

/**
 * 筛选设施
 */
function filterFacilities(category) {
    // 更新标签状态
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    renderFacilitiesList(category);
}

/**
 * 渲染设施列表
 */
function renderFacilitiesList(category) {
    const facilities = Game.getFacilitiesOverview();
    const listElement = document.getElementById('facilitiesList');
    let html = '';
    
    const categoryFacilities = facilities[category]?.facilities || [];
    
    categoryFacilities.forEach(facility => {
        const isOwned = facility.owned > 0;
        const canUpgrade = isOwned && facility.currentLevel < facility.maxLevel;
        const upgradeCost = canUpgrade ? facility.upgradeCost[facility.currentLevel] : 0;
        
        html += `
            <div class="facility-card" data-category="${category}" data-id="${facility.id}">
                <div class="facility-header">
                    <span class="facility-icon">${facility.icon}</span>
                    <div class="facility-info">
                        <span class="facility-name">${facility.name}</span>
                        <span class="facility-category">${getCategoryName(facility.category)}</span>
                    </div>
                    <div class="facility-status ${isOwned ? 'owned' : 'available'}">
                        ${isOwned ? `等级 ${facility.currentLevel}/${facility.maxLevel}` : '未购买'}
                    </div>
                </div>
                
                <div class="facility-stats">
                    ${category === 'power' ? `
                        <div class="stat-row">
                            <span class="stat-label">发电能力</span>
                            <span class="stat-value">${facility.energyOutput} MW</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">效率</span>
                            <span class="stat-value">${Math.round(facility.efficiency * 100)}%</span>
                        </div>
                    ` : ''}
                    
                    ${category !== 'power' ? `
                        <div class="stat-row">
                            <span class="stat-label">能耗</span>
                            <span class="stat-value">${facility.energyConsumption} MW/h</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">覆盖范围</span>
                            <span class="stat-value">${facility.coverage > 0 ? facility.coverage + ' 人' : '无'}</span>
                        </div>
                    ` : ''}
                    
                    <div class="stat-row">
                        <span class="stat-label">剩余寿命</span>
                        <span class="stat-value">${facility.remainingLife} 年</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">运行效率</span>
                        <div class="efficiency-bar">
                            <div class="efficiency-fill" style="width: ${facility.efficiency * 100}%"></div>
                        </div>
                        <span class="stat-value">${Math.round(facility.efficiency * 100)}%</span>
                    </div>
                </div>
                
                ${isOwned && category !== 'power' && facility.effect ? `
                    <div class="facility-effect">
                        <span class="effect-label">效果：</span>
                        <span class="effect-value">${getEffectName(facility.effect)} +${facility.effectValue}</span>
                    </div>
                ` : ''}
                
                ${category === 'commercial' && isOwned ? `
                    <div class="facility-revenue">
                        <span class="revenue-label">月收入：</span>
                        <span class="revenue-value">${Math.round(facility.revenue * facility.efficiency).toLocaleString()} 元</span>
                    </div>
                ` : ''}
                
                <div class="facility-cost">
                    <span class="cost-label">月维护费：</span>
                    <span class="cost-value">${facility.baseMaintenance.toLocaleString()} 元</span>
                </div>
                
                <div class="facility-actions">
                    ${!isOwned ? `
                        <button class="action-btn buy" onclick="purchaseFacility('${category}', '${facility.id}')">
                            购买 (${facility.baseCost.toLocaleString()}元)
                        </button>
                    ` : ''}
                    ${canUpgrade ? `
                        <button class="action-btn upgrade" onclick="upgradeFacilityItem('${category}', '${facility.id}')">
                            升级到 ${facility.currentLevel + 1} 级 (${upgradeCost.toLocaleString()}元)
                        </button>
                    ` : ''}
                    ${isOwned && !canUpgrade ? `
                        <span class="max-level">已达最高等级</span>
                    ` : ''}
                </div>
                
                ${isOwned ? `
                    <div class="upgrade-tree">
                        <div class="upgrade-tree-header">升级路径</div>
                        <div class="upgrade-levels">
                            ${renderUpgradeTree(facility)}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    listElement.innerHTML = html;
}

/**
 * 渲染升级树
 */
function renderUpgradeTree(facility) {
    let html = '';
    
    for (let i = 0; i < facility.maxLevel; i++) {
        const isCurrent = i + 1 === facility.currentLevel;
        const isLocked = i + 1 > facility.currentLevel;
        
        html += `
            <div class="upgrade-level ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}">
                <div class="level-number">${i + 1}</div>
                <div class="level-info">
                    ${facility.upgradeOutput ? `<span>发电: ${facility.upgradeOutput[i]} MW</span>` : ''}
                    ${facility.upgradeEnergy ? `<span>能耗: ${facility.upgradeEnergy[i]} MW/h</span>` : ''}
                    ${facility.upgradeMaintenance ? `<span>维护: ${facility.upgradeMaintenance[i]} 元/月</span>` : ''}
                    ${facility.upgradeRevenue ? `<span>收入: ${facility.upgradeRevenue[i]} 元/月</span>` : ''}
                </div>
                ${!isLocked && !isCurrent ? `<div class="level-cost">${facility.upgradeCost[i].toLocaleString()}元</div>` : ''}
            </div>
        `;
    }
    
    return html;
}

/**
 * 获取类别名称
 */
function getCategoryName(category) {
    const names = {
        fossil: '化石能源',
        renewable: '可再生能源',
        nuclear: '核能',
        health: '医疗',
        education: '教育',
        safety: '安全',
        utility: '公用事业',
        retail: '零售',
        office: '办公'
    };
    return names[category] || category;
}

/**
 * 获取效果名称
 */
function getEffectName(effect) {
    const names = {
        health: '健康度',
        education: '教育度',
        safety: '安全度',
        happiness: '幸福度',
        environment: '环境'
    };
    return names[effect] || effect;
}

/**
 * 购买设施
 */
function purchaseFacility(category, facilityId) {
    const success = Game.buyFacility(category, facilityId);
    if (success) {
        updateFacilitiesPanel();
        updateDisplay();
    }
}

/**
 * 升级设施
 */
function upgradeFacilityItem(category, facilityId) {
    const success = Game.upgradeFacility(category, facilityId);
    if (success) {
        updateFacilitiesPanel();
        updateDisplay();
    }
}

/**
 * 更新财政报表
 */
function updateFinanceReport() {
    const facilities = Game.getFacilitiesOverview();
    const revenue = facilities.totalRevenue;
    const maintenance = facilities.totalMaintenance;
    const profit = revenue - maintenance;
    
    document.getElementById('facilityRevenue').textContent = Math.round(revenue * 24 * 30).toLocaleString();
    document.getElementById('facilityMaintenance').textContent = (maintenance * 30).toLocaleString();
    
    const profitElement = document.getElementById('facilityProfit');
    profitElement.textContent = (profit >= 0 ? '+' : '') + Math.round(profit * 24 * 30).toLocaleString();
    profitElement.style.color = profit >= 0 ? 'var(--positive)' : 'var(--negative)';
    
    // 计算投资回收期
    const roi = document.getElementById('facilityROI');
    if (profit <= 0) {
        roi.textContent = '--';
    } else {
        const totalInvestment = calculateTotalInvestment();
        roi.textContent = Math.round(totalInvestment / (profit * 24));
    }
}

/**
 * 计算总投资
 */
function calculateTotalInvestment() {
    let total = 0;
    const facilities = Game.state.facilities;
    
    Object.keys(facilities.power).forEach(key => {
        const f = facilities.power[key];
        if (f.owned > 0) {
            for (let i = 0; i < f.currentLevel; i++) {
                total += f.upgradeCost[i];
            }
        }
    });
    
    Object.keys(facilities.services).forEach(key => {
        const f = facilities.services[key];
        if (f.owned > 0) {
            for (let i = 0; i < f.currentLevel; i++) {
                total += f.upgradeCost[i];
            }
        }
    });
    
    Object.keys(facilities.commercial).forEach(key => {
        const f = facilities.commercial[key];
        if (f.owned > 0) {
            for (let i = 0; i < f.currentLevel; i++) {
                total += f.upgradeCost[i];
            }
        }
    });
    
    return total;
}

/**
 * 更新财政周期
 */
function updateFinancePeriod(period) {
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    // 根据周期更新显示（简化实现）
    updateFinanceReport();
}

/**
 * 切换主题
 */
function toggleTheme() {
    Game.state.isDarkTheme = !Game.state.isDarkTheme;
    document.body.classList.toggle('theme-light', !Game.state.isDarkTheme);
    document.getElementById('themeIcon').textContent = Game.state.isDarkTheme ? '◐' : '◑';
    document.getElementById('themeText').textContent = Game.state.isDarkTheme ? '深色' : '浅色';
}

/**
 * 切换政策标签
 */
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    Policies.renderSliders(tab);
}

/**
 * 切换设置标签
 */
function switchSettingsTab(tab) {
    document.querySelectorAll('.settings-nav-item').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.settings-tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('settingsTab-' + tab).classList.add('active');
}

/**
 * 同步设置输入框
 */
function syncSettingsInputs() {
    const state = Game.state;
    document.getElementById('initPop').value = state.population;
    document.getElementById('initMoney').value = state.money;
    document.getElementById('initHappy').value = state.happiness;
    document.getElementById('setBirthRate').value = state.birthRate;
    document.getElementById('setDeathRate').value = state.deathRate;
    document.getElementById('setIncome').value = state.baseIncome;
    document.getElementById('setExpense').value = state.baseExpense;
}

/**
 * 应用设置
 */
function applySettings() {
    Game.state.birthRate = parseFloat(document.getElementById('setBirthRate').value) || 0.8;
    Game.state.deathRate = parseFloat(document.getElementById('setDeathRate').value) || 0.5;
    Game.state.baseIncome = parseInt(document.getElementById('setIncome').value) || 3500;
    Game.state.baseExpense = parseInt(document.getElementById('setExpense').value) || 1500;
    Game.addLog('设置已应用', 'success');
    updateDisplay();
}

/**
 * 重置设置
 */
function resetSettings() {
    const defaults = Game.defaultState;
    document.getElementById('setBirthRate').value = defaults.birthRate;
    document.getElementById('setDeathRate').value = defaults.deathRate;
    document.getElementById('setIncome').value = defaults.baseIncome;
    document.getElementById('setExpense').value = defaults.baseExpense;
    Game.state.birthRate = defaults.birthRate;
    Game.state.deathRate = defaults.deathRate;
    Game.state.baseIncome = defaults.baseIncome;
    Game.state.baseExpense = defaults.baseExpense;
    Game.addLog('设置已恢复默认', 'success');
    updateDisplay();
}

/**
 * 更新能源监控显示
 */
function updatePowerDisplay() {
    const state = Game.state;
    const power = state.powerGeneration;
    
    // 更新总发电量和购买电量
    const totalSupply = power.total + power.purchase;
    document.getElementById('powerTotal').textContent = totalSupply;
    document.getElementById('powerConsume').textContent = power.consumption;
    document.getElementById('powerStorage').textContent = Math.round(power.storage);
    
    // 更新发电来源
    document.getElementById('powerCoal').textContent = Math.round(power.coal);
    document.getElementById('powerHydro').textContent = Math.round(power.hydro);
    document.getElementById('powerSolar').textContent = Math.round(power.solar);
    document.getElementById('powerWind').textContent = Math.round(power.wind);
    document.getElementById('powerNuclear').textContent = Math.round(power.nuclear);
    
    // 更新购买电量显示
    const purchaseEl = document.getElementById('powerPurchase');
    if (purchaseEl) {
        if (power.purchase > 0) {
            purchaseEl.textContent = `+${Math.round(power.purchase)}`;
            purchaseEl.style.color = 'var(--negative)';
        } else {
            purchaseEl.textContent = '0';
            purchaseEl.style.color = 'var(--text-muted)';
        }
    }
    
    // 更新发电/消耗进度条
    const maxPower = 200;
    const consumePercent = (power.consumption / maxPower) * 100;
    const generatePercent = (totalSupply / maxPower) * 100;
    
    document.getElementById('powerConsumption').style.width = consumePercent + '%';
    document.getElementById('powerGeneration').style.width = generatePercent + '%';
}

/**
 * 更新建设进度显示
 */
function updateConstructionDisplay() {
    const state = Game.state;
    const construction = state.construction;
    
    // 绿化建设
    const greenProgress = Math.min(100, Math.round(construction.greenCity.progress));
    document.getElementById('constGreen').style.width = greenProgress + '%';
    document.getElementById('constGreenPercent').textContent = greenProgress + '%';
    
    // 道路建设
    const roadProgress = Math.min(100, Math.round(construction.roads.progress));
    document.getElementById('constRoads').style.width = roadProgress + '%';
    document.getElementById('constRoadsPercent').textContent = roadProgress + '%';
    
    // 住房建设
    const housingProgress = Math.min(100, Math.round(construction.housing.progress));
    document.getElementById('constHousing').style.width = housingProgress + '%';
    document.getElementById('constHousingPercent').textContent = housingProgress + '%';
    
    // 发电厂
    const powerProgress = Math.min(100, Math.round(construction.powerPlant.progress));
    document.getElementById('constPower').style.width = powerProgress + '%';
    document.getElementById('constPowerPercent').textContent = powerProgress + '%';
    
    // 医院
    const hospitalProgress = Math.min(100, Math.round(construction.hospital.progress));
    document.getElementById('constHospital').style.width = hospitalProgress + '%';
    document.getElementById('constHospitalPercent').textContent = hospitalProgress + '%';
    
    // 学校
    const schoolProgress = Math.min(100, Math.round(construction.school.progress));
    document.getElementById('constSchool').style.width = schoolProgress + '%';
    document.getElementById('constSchoolPercent').textContent = schoolProgress + '%';
}

// 导出
window.UI = {
    updateDisplay,
    updateTimeDisplay,
    updateHeroDisplay,
    updateFinanceDisplay,
    updateZoneDisplay,
    updatePopulationDisplay,
    updateSectorDisplay,
    updateDemandDisplay,
    updateStatsDisplay,
    updatePowerDisplay,
    updateConstructionDisplay,
    switchView,
    closePanel,
    openModal,
    closeModal,
    toggleTheme,
    switchTab,
    switchSettingsTab,
    syncSettingsInputs,
    applySettings,
    resetSettings
};