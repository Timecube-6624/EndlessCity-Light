// game.js - 游戏状态和模拟模块

// 默认游戏状态
const defaultState = {
    // 基础数据 - 新城市从零开始
    population: 0,
    tourists: 0,
    money: 10000,
    happiness: 50,
    year: 1,
    month: 1,
    day: 1,
    hour: 6,
    minute: 0,
    
    // 城市吸引力 - 初始80%
    cityAttractiveness: 80,
    
    // 经济数据 - 新城市起步
    gdp: 100,
    growth: 0,
    inflation: 0,
    energy: 50,
    
    // 能源数据 - 初始无发电设施，无用电需求
    powerGeneration: {
        total: 0,             // 总发电量 (MW) - 初始为0
        coal: 0,              // 燃煤发电 - 需购买
        hydro: 0,             // 水力发电 - 需购买
        solar: 0,             // 太阳能发电 - 需购买
        wind: 0,              // 风力发电 - 需购买
        nuclear: 0,           // 核能发电 - 需购买
        consumption: 0,       // 当前消耗 - 初始为0
        storage: 0,           // 储能 - 需购买
        purchase: 0,          // 购买的电量
        purchasePrice: 10     // 购买电价 (单位：每MW)
    },
    
    // 实时数据更新
    realTime: {
        lastUpdate: 0,        // 上次更新时间
        incomeRate: 0,        // 收入率 (每分钟)
        expenseRate: 0,       // 支出率 (每分钟)
        populationRate: 0     // 人口变化率 (每分钟)
    },
    
    // 人口结构 - 新城市无人口
    workers: 0,
    elders: 0,
    children: 0,
    unemployedRate: 0,
    birthRate: 0,
    deathRate: 0,
    
    // 工业就业人口数据 - 新城市无工业就业
    industryEmployment: {
        manufacturing: 0,     // 制造业就业人口
        heavyIndustry: 0,     // 重工业就业人口
        hiTech: 0,            // 高新技术产业就业人口
        total: 0,             // 工业总就业人口
        ratio: 0              // 工业就业占劳动力比例(%)
    },
    
    // 劳动力市场数据
    laborMarket: {
        totalLaborForce: 0,   // 劳动力总量
        employed: 0,          // 就业人口
        unemployed: 0,        // 失业人口
        skillLevels: {        // 技能结构
            high: 0,          // 高技能
            medium: 0,        // 中等技能
            low: 0            // 低技能
        }
    },
    
    // 技术进步与自动化水平
    technology: {
        automationLevel: 0,   // 自动化水平 0-100
        techProgress: 0,      // 技术进步指数
        laborProductivity: 1  // 劳动生产率倍数
    },
    
    // 收支 - 新城市无收支
    baseIncome: 0,
    baseExpense: 0,
    
    // 预算分配 - 初始预算
    budget: {
        infrastructure: 500,    // 基础设施
        education: 200,         // 教育
        healthcare: 200,        // 医疗
        publicSafety: 150,      // 公共安全
        environment: 100,       // 环境保护
        socialWelfare: 200,     // 社会福利
        total: 1350             // 总预算
    },
    
    // 建设进度 - 新城市无建设
    construction: {
        greenCity: { progress: 0, target: 100, cost: 5000 },
        roads: { progress: 0, target: 100, cost: 8000 },
        housing: { progress: 0, target: 100, cost: 12000 },
        powerPlant: { progress: 0, target: 100, cost: 15000 },
        hospital: { progress: 0, target: 100, cost: 10000 },
        school: { progress: 0, target: 100, cost: 6000 }
    },
    
    // 产业板块 - 新城市起步
    industry: {
        manufacturing: 5,     // 制造业 - 初始小规模
        heavyIndustry: 0,     // 重工业 - 尚未发展
        hiTech: 0             // 高新技术产业 - 尚未发展
    },
    commerce: 5,       // 商业 - 初始少量
    service: 3,        // 服务业 - 初始少量
    agriculture: 10,   // 农业 - 基础农业
    tourism: 5,        // 旅游 - 尚未开发
    
    // 城市功能区占比 - 初始规划
    zones: {
        residential: {
            lowDensity: 10,       // 低密度住宅区（独立房屋）
            mediumDensity: 5,     // 中密度住宅区（多层公寓）
            highDensity: 0,       // 高密度住宅区（高层公寓）
            skyscraper: 0         // 超高层住宅区（摩天大楼）
        },
        commercial: 10,
        industrial: 5,
        public: 5,
        green: 10
    },
    
    // 城市需求 - 初始需求
    basicDemand: 30,
    developDemand: 20,
    leisureDemand: 10,
    
    // 城市指标 - 新城市低水平起步
    education: 20,
    health: 20,
    environment: 50,
    safety: 30,
    
    // 政策调节值
    policyValues: {
        // 税率调节
        taxManufacturing: 15,   // 制造业税率 0-50
        taxHeavyIndustry: 18,   // 重工业税率 0-50
        taxHiTech: 8,          // 高新技术产业税率 0-50
        taxCommerce: 18,       // 商业税率 0-50
        taxResidential: 10,    // 居住税率 0-50
        taxOffice: 12,         // 办公税率 0-50
        
        techInvest: 10,        // 科技投资 0-100
        tradeOpen: 30,         // 贸易开放度 0-100
        minWage: 50,           // 最低工资 0-100
        industrialUpgrade: 20,  // 产业升级 0-100
        energySaving: 15,      // 节能减排 0-100
        industrialZone: 25,    // 工业园区建设 0-100
        healthcare: 40,        // 医疗投入 0-100
        educationInvest: 50,    // 教育投入 0-100
        welfare: 30,           // 社会福利 0-100
        pension: 40,           // 养老金 0-100
        roadBuild: 20,         // 道路建设 0-100
        greenCity: 30,         // 绿化建设 0-100
        housing: 25,           // 住房建设 0-100
        police: 35             // 治安投入 0-100
    },
    
    // 地理位置
    latitude: 39.9,
    longitude: 116.4,
    
    // 外部链接系统 - 公路、铁路、飞机、驳船
    externalLinks: {
        // 公路系统 - 初始提供一条公路入口
        highway: {
            owned: 1,              // 已购买数量（初始1条）
            capacity: 80,          // 单条容量（车辆通行单位/小时）- 降低容量
            buyCost: 80000,        // 购买费用 - 提高
            maintenanceCost: 8000,   // 月维护费（单条）- 大幅提高，平衡收入
            ticketPrice: 3,        // 车票价（小型客车）- 大幅降低
            tollFee: 5,            // 过路费（小型客车）- 大幅降低
            usageRate: 0.5,        // 使用率 - 降低
            monthlyUsers: 0,       // 月度使用人次
            monthlyRevenue: 0,     // 月度收入
            totalRevenue: 0,       // 累计收入
            // 车辆类型配置
            vehicleTypes: {
                bus: {             // 大型客车
                    capacityUnits: 2,   // 占用2个通行单位
                    passengers: 55,     // 可运载55名市民
                    ticketPrice: 8,     // 车票价 - 大幅降低
                    tollFee: 12,        // 过路费 - 大幅降低
                    weight: 0.15        // 占总流量比例
                },
                car: {             // 小型客车（私家车、出租车）
                    capacityUnits: 1,   // 占用1个通行单位
                    passengers: 4,      // 最多运载4名乘客
                    ticketPrice: 3,     // 车票价 - 大幅降低
                    tollFee: 5,         // 过路费 - 大幅降低
                    weight: 0.60        // 占总流量比例
                },
                truck: {           // 货车
                    capacityUnits: 2,   // 占用2个通行单位
                    passengers: 0,      // 不运载乘客
                    ticketPrice: 0,     // 无车票
                    tollFee: 15,        // 过路费（货车较高）- 大幅降低
                    cargoCapacity: 10,  // 货物运载量（吨）
                    weight: 0.25        // 占总流量比例
                }
            }
        },
        // 铁路系统 - 高成本高容量
        rail: {
            owned: 0,
            capacity: 600,         // 单条容量（人次/小时）- 降低
            buyCost: 200000,       // 购买费用（高成本）- 提高
            maintenanceCost: 20000, // 月维护费（单条）- 大幅提高
            ticketPrice: 15,       // 车票价 - 大幅降低
            tollFee: 0,            // 铁路无需过路费
            usageRate: 0.6,        // 降低使用率
            monthlyUsers: 0,
            monthlyRevenue: 0,
            totalRevenue: 0
        },
        // 航空系统 - 最高成本
        air: {
            owned: 0,
            capacity: 300,         // 单条容量（人次/小时）- 降低
            buyCost: 800000,       // 购买费用（最高）- 提高
            maintenanceCost: 50000, // 月维护费（单条）- 大幅提高
            ticketPrice: 200,      // 机票价 - 大幅降低
            tollFee: 0,            // 航空无需过路费
            usageRate: 0.4,        // 降低使用率
            monthlyUsers: 0,
            monthlyRevenue: 0,
            totalRevenue: 0
        },
        // 航运系统
        shipping: {
            owned: 0,
            capacity: 400,         // 单条容量（人次/小时）- 降低
            buyCost: 150000,       // 购买费用 - 提高
            maintenanceCost: 12000, // 月维护费（单条）- 大幅提高
            ticketPrice: 25,       // 船票价 - 大幅降低
            tollFee: 12,           // 港口费 - 大幅降低
            usageRate: 0.35,       // 降低使用率
            monthlyUsers: 0,
            monthlyRevenue: 0,
            totalRevenue: 0
        }
    },
    
    // 服务设施系统
    facilities: {
        // 发电设施
        power: {
            coalPlant: {
                name: '燃煤发电厂',
                icon: '🏭',
                type: 'power',
                category: 'fossil',
                owned: 0,
                maxLevel: 5,
                currentLevel: 0,
                baseCost: 50000,
                baseMaintenance: 500,
                energyOutput: 50,
                energyConsumption: 0,
                efficiency: 0.85,
                lifespan: 30,
                remainingLife: 30,
                coverage: 0,
                upgradeCost: [50000, 80000, 120000, 180000, 250000],
                upgradeOutput: [50, 80, 120, 180, 250],
                upgradeMaintenance: [500, 800, 1200, 1800, 2500]
            },
            hydroPlant: {
                name: '水力发电站',
                icon: '💧',
                type: 'power',
                category: 'renewable',
                owned: 0,
                maxLevel: 5,
                currentLevel: 0,
                baseCost: 100000,
                baseMaintenance: 300,
                energyOutput: 80,
                energyConsumption: 0,
                efficiency: 0.95,
                lifespan: 50,
                remainingLife: 50,
                coverage: 0,
                upgradeCost: [100000, 150000, 220000, 320000, 450000],
                upgradeOutput: [80, 130, 200, 300, 450],
                upgradeMaintenance: [300, 450, 650, 950, 1350]
            },
            solarPlant: {
                name: '太阳能发电站',
                icon: '☀️',
                type: 'power',
                category: 'renewable',
                owned: 0,
                maxLevel: 5,
                currentLevel: 0,
                baseCost: 80000,
                baseMaintenance: 100,
                energyOutput: 30,
                energyConsumption: 0,
                efficiency: 0.25,
                lifespan: 25,
                remainingLife: 25,
                coverage: 0,
                upgradeCost: [80000, 120000, 180000, 270000, 400000],
                upgradeOutput: [30, 50, 80, 120, 180],
                upgradeMaintenance: [100, 150, 220, 330, 490]
            },
            windFarm: {
                name: '风力发电场',
                icon: '🌀',
                type: 'power',
                category: 'renewable',
                owned: 0,
                maxLevel: 5,
                currentLevel: 0,
                baseCost: 60000,
                baseMaintenance: 150,
                energyOutput: 40,
                energyConsumption: 0,
                efficiency: 0.35,
                lifespan: 20,
                remainingLife: 20,
                coverage: 0,
                upgradeCost: [60000, 90000, 135000, 200000, 300000],
                upgradeOutput: [40, 65, 100, 150, 220],
                upgradeMaintenance: [150, 220, 330, 490, 730]
            },
            nuclearPlant: {
                name: '核能发电厂',
                icon: '⚛️',
                type: 'power',
                category: 'nuclear',
                owned: 0,
                maxLevel: 3,
                currentLevel: 0,
                baseCost: 500000,
                baseMaintenance: 2000,
                energyOutput: 300,
                energyConsumption: 0,
                efficiency: 0.99,
                lifespan: 40,
                remainingLife: 40,
                coverage: 0,
                upgradeCost: [500000, 800000, 1200000],
                upgradeOutput: [300, 500, 800],
                upgradeMaintenance: [2000, 3200, 4800]
            }
        },
        // 公共服务设施
        services: {
            hospital: {
                name: '医院',
                icon: '🏥',
                type: 'service',
                category: 'health',
                owned: 0,
                maxLevel: 5,
                currentLevel: 0,
                baseCost: 150000,
                baseMaintenance: 3000,
                energyConsumption: 20,
                coverage: 5000,
                efficiency: 1.0,
                lifespan: 40,
                remainingLife: 40,
                effect: 'health',
                effectValue: 10,
                upgradeCost: [150000, 250000, 400000, 600000, 900000],
                upgradeCoverage: [5000, 8000, 12000, 18000, 25000],
                upgradeEnergy: [20, 30, 45, 65, 90],
                upgradeMaintenance: [3000, 4500, 6500, 9500, 13500],
                upgradeEffect: [10, 15, 22, 32, 45]
            },
            school: {
                name: '学校',
                icon: '🏫',
                type: 'service',
                category: 'education',
                owned: 0,
                maxLevel: 5,
                currentLevel: 0,
                baseCost: 80000,
                baseMaintenance: 1500,
                energyConsumption: 10,
                coverage: 3000,
                efficiency: 1.0,
                lifespan: 35,
                remainingLife: 35,
                effect: 'education',
                effectValue: 8,
                upgradeCost: [80000, 130000, 200000, 300000, 450000],
                upgradeCoverage: [3000, 5000, 8000, 12000, 18000],
                upgradeEnergy: [10, 15, 22, 32, 45],
                upgradeMaintenance: [1500, 2200, 3300, 4900, 7300],
                upgradeEffect: [8, 12, 18, 26, 38]
            },
            policeStation: {
                name: '警察局',
                icon: '🚓',
                type: 'service',
                category: 'safety',
                owned: 0,
                maxLevel: 5,
                currentLevel: 0,
                baseCost: 100000,
                baseMaintenance: 2000,
                energyConsumption: 8,
                coverage: 4000,
                efficiency: 1.0,
                lifespan: 30,
                remainingLife: 30,
                effect: 'safety',
                effectValue: 12,
                upgradeCost: [100000, 160000, 250000, 380000, 550000],
                upgradeCoverage: [4000, 6500, 10000, 15000, 22000],
                upgradeEnergy: [8, 12, 18, 26, 38],
                upgradeMaintenance: [2000, 3000, 4500, 6500, 9500],
                upgradeEffect: [12, 18, 26, 38, 55]
            },
            fireStation: {
                name: '消防局',
                icon: '🚒',
                type: 'service',
                category: 'safety',
                owned: 0,
                maxLevel: 5,
                currentLevel: 0,
                baseCost: 120000,
                baseMaintenance: 2500,
                energyConsumption: 12,
                coverage: 3500,
                efficiency: 1.0,
                lifespan: 30,
                remainingLife: 30,
                effect: 'safety',
                effectValue: 8,
                upgradeCost: [120000, 190000, 300000, 450000, 650000],
                upgradeCoverage: [3500, 5500, 8500, 13000, 19000],
                upgradeEnergy: [12, 18, 27, 40, 58],
                upgradeMaintenance: [2500, 3800, 5500, 8000, 11500],
                upgradeEffect: [8, 12, 18, 26, 38]
            },
            waterPlant: {
                name: '自来水厂',
                icon: '🚰',
                type: 'service',
                category: 'utility',
                owned: 0,
                maxLevel: 5,
                currentLevel: 0,
                baseCost: 200000,
                baseMaintenance: 4000,
                energyConsumption: 30,
                coverage: 10000,
                efficiency: 1.0,
                lifespan: 50,
                remainingLife: 50,
                effect: 'happiness',
                effectValue: 5,
                upgradeCost: [200000, 320000, 500000, 750000, 1100000],
                upgradeCoverage: [10000, 16000, 25000, 38000, 55000],
                upgradeEnergy: [30, 45, 65, 95, 135],
                upgradeMaintenance: [4000, 6000, 9000, 13000, 19000],
                upgradeEffect: [5, 8, 12, 17, 25]
            },
            wastePlant: {
                name: '污水处理厂',
                icon: '♻️',
                type: 'service',
                category: 'utility',
                owned: 0,
                maxLevel: 5,
                currentLevel: 0,
                baseCost: 180000,
                baseMaintenance: 3500,
                energyConsumption: 25,
                coverage: 8000,
                efficiency: 1.0,
                lifespan: 45,
                remainingLife: 45,
                effect: 'environment',
                effectValue: 8,
                upgradeCost: [180000, 280000, 440000, 660000, 950000],
                upgradeCoverage: [8000, 13000, 20000, 30000, 44000],
                upgradeEnergy: [25, 38, 55, 80, 115],
                upgradeMaintenance: [3500, 5200, 7600, 11000, 16000],
                upgradeEffect: [8, 12, 18, 26, 38]
            }
        },
        // 商业设施
        commercial: {
            shoppingMall: {
                name: '购物中心',
                icon: '🏬',
                type: 'commercial',
                category: 'retail',
                owned: 0,
                maxLevel: 5,
                currentLevel: 0,
                baseCost: 300000,
                baseMaintenance: 5000,
                energyConsumption: 40,
                coverage: 15000,
                efficiency: 1.0,
                lifespan: 30,
                remainingLife: 30,
                revenue: 2000,
                upgradeCost: [300000, 480000, 750000, 1100000, 1600000],
                upgradeCoverage: [15000, 24000, 38000, 57000, 85000],
                upgradeEnergy: [40, 60, 90, 130, 190],
                upgradeMaintenance: [5000, 7500, 11000, 16000, 23000],
                upgradeRevenue: [2000, 3500, 6000, 10000, 17000]
            },
            officeBuilding: {
                name: '办公楼',
                icon: '🏢',
                type: 'commercial',
                category: 'office',
                owned: 0,
                maxLevel: 5,
                currentLevel: 0,
                baseCost: 250000,
                baseMaintenance: 4000,
                energyConsumption: 35,
                coverage: 0,
                efficiency: 1.0,
                lifespan: 40,
                remainingLife: 40,
                revenue: 1500,
                upgradeCost: [250000, 400000, 620000, 920000, 1350000],
                upgradeCoverage: [0, 0, 0, 0, 0],
                upgradeEnergy: [35, 52, 78, 115, 170],
                upgradeMaintenance: [4000, 6000, 8800, 13000, 19000],
                upgradeRevenue: [1500, 2600, 4500, 7700, 13000]
            }
        }
    },
    
    // 能源预警状态
    energyAlert: {
        level: 0,           // 0=正常, 1=警告, 2=严重, 3=危急
        lastAlertTime: 0,
        active: false
    },
    
    // 游戏状态
    speed: 2,
    isPlaying: false,
    autoTimer: null,
    isDarkTheme: true,
    gameStarted: false,
    
    // 上次月份（用于触发月度结算）
    lastMonth: 1
};

// 游戏状态实例
let gameState = JSON.parse(JSON.stringify(defaultState));

/**
 * 获取月份天数
 */
/**
 * 获取月份天数（支持闰年）
 */
function getDaysInMonth(month) {
    // 确保月份有效
    const validMonth = Math.max(1, Math.min(12, Math.floor(month)));
    
    // 检查闰年
    const isLeapYear = (year) => {
        return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    };
    
    const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (validMonth === 2 && isLeapYear(gameState.year)) {
        return 29;
    }
    return days[validMonth - 1];
}

// ==================== 外部链接系统 ====================

/**
 * 购买外部链接
 * @param {string} type - 链接类型：highway, rail, air, shipping
 * @returns {boolean} - 是否购买成功
 */
function buyExternalLink(type) {
    const link = gameState.externalLinks[type];
    if (!link) {
        addLog('✗ 无效的链接类型', 'error');
        return false;
    }
    
    if (gameState.money < link.buyCost) {
        addLog(`✗ 资金不足，购买${getLinkName(type)}需要 ${link.buyCost.toLocaleString()}`, 'warning');
        return false;
    }
    
    gameState.money -= link.buyCost;
    link.owned++;
    
    const linkName = getLinkName(type);
    addLog(`✓ 已购买 ${linkName} #${link.owned}，花费 ${link.buyCost.toLocaleString()}`, 'success');
    
    // 更新UI
    if (typeof updateExternalLinksDisplay === 'function') {
        updateExternalLinksDisplay();
    }
    
    return true;
}

/**
 * 获取链接类型名称
 */
function getLinkName(type) {
    const names = {
        highway: '公路',
        rail: '铁路',
        air: '航空',
        shipping: '航运'
    };
    return names[type] || type;
}

/**
 * 计算外部链接总维护费用（月度）
 */
function calculateTotalMaintenanceCost() {
    const links = gameState.externalLinks;
    let total = 0;
    
    for (const type in links) {
        total += links[type].owned * links[type].maintenanceCost;
    }
    
    return total;
}

/**
 * 计算外部链接总容量
 */
function calculateTotalLinkCapacity() {
    const links = gameState.externalLinks;
    let total = 0;
    
    for (const type in links) {
        total += links[type].owned * links[type].capacity;
    }
    
    return total;
}

/**
 * 计算外部链接总收益
 */
function calculateExternalLinksRevenue() {
    const links = gameState.externalLinks;
    const revenue = {};
    let totalRevenue = 0;
    let totalUsers = 0;
    
    for (const type in links) {
        const link = links[type];
        const linkRevenue = link.monthlyUsers > 0 ? link.monthlyUsers * (link.ticketPrice + link.tollFee) * 0.8 : 0;
        revenue[type] = linkRevenue;
        totalRevenue += linkRevenue;
        totalUsers += link.monthlyUsers;
    }
    
    return { ...revenue, total: totalRevenue, totalUsers };
}

/**
 * 模拟市民流动（每小时调用）
 */
function simulateCitizenFlow() {
    const links = gameState.externalLinks;
    const pv = gameState.policyValues;
    
    // 计算城市吸引力和人口压力
    const attractiveness = gameState.cityAttractiveness / 100;
    const popPressure = gameState.population > 0 ? Math.min(1, 5000 / gameState.population) : 1;
    const happinessFactor = gameState.happiness / 100;
    const maxPop = calculateMaxPopulation(gameState.zones);
    const maxTourists = Math.max(100, maxPop * 0.3); // 游客最低100
    
    // 外部链接带来的访客和居民
    let totalInflow = 0;
    let totalOutflow = 0;
    let totalCargoIn = 0;
    let totalCargoOut = 0;
    let totalTouristsToAdd = 0;
    let totalResidentsToConvert = 0;
    
    for (const type in links) {
        const link = links[type];
        if (link.owned <= 0) continue;
        
        // 公路系统使用车辆类型计算
        if (type === 'highway' && link.vehicleTypes) {
            const result = simulateHighwayFlow(link, attractiveness, happinessFactor, popPressure);
            totalInflow += result.passengerInflow;
            totalOutflow += result.passengerOutflow;
            totalCargoIn += result.cargoInflow;
            totalCargoOut += result.cargoOutflow;
            link.monthlyUsers += result.passengerInflow;
            link.monthlyRevenue += result.revenue;
            link.totalRevenue += result.revenue;
            
            // 累积需要添加的游客，不立即修改
            totalTouristsToAdd += Math.floor(result.passengerInflow * 0.8);
            
            // 累积需要转换的居民
            if (gameState.population > 0) {
                const vacancyRate = Math.max(0, (maxPop - gameState.population) / maxPop);
                const conversionChance = attractiveness * 0.002 * vacancyRate;
                const converted = Math.floor(result.passengerInflow * 0.2 * conversionChance);
                if (converted > 0 && gameState.population < maxPop) {
                    totalResidentsToConvert += converted;
                }
            }
        } else {
            // 其他链接类型（铁路、航空、航运）使用原有计算
            const baseCapacity = link.owned * link.capacity;
            const baseFlow = baseCapacity * link.usageRate * (0.5 + Math.random() * 0.5);
            
            // 调整因素：吸引力、幸福度、人口压力
            const flowModifier = attractiveness * happinessFactor * (1 + popPressure * 0.5);
            const hourlyFlow = Math.floor(baseFlow * flowModifier);
            
            // 进城人数（游客和新居民）
            const inflow = Math.floor(hourlyFlow * 0.6);
            // 出城人数
            const outflow = Math.floor(hourlyFlow * 0.4);
            
            // 更新链接数据
            const hourlyRevenue = inflow * (link.ticketPrice + link.tollFee) * 0.8;
            link.monthlyUsers += inflow;
            link.monthlyRevenue += hourlyRevenue;
            link.totalRevenue += hourlyRevenue;
            
            totalInflow += inflow;
            totalOutflow += outflow;
            
            // 累积需要添加的游客
            totalTouristsToAdd += Math.floor(inflow * 0.8);
            
            // 累积需要转换的居民
            if (gameState.population > 0) {
                const vacancyRate = Math.max(0, (maxPop - gameState.population) / maxPop);
                const conversionChance = attractiveness * 0.002 * vacancyRate;
                const converted = Math.floor(inflow * 0.2 * conversionChance);
                if (converted > 0 && gameState.population < maxPop) {
                    totalResidentsToConvert += converted;
                }
            }
        }
    }
    
    // 统一更新游客和居民数量，避免冲突
    if (totalTouristsToAdd > 0) {
        gameState.tourists = Math.min(maxTourists, gameState.tourists + totalTouristsToAdd);
    }
    if (totalResidentsToConvert > 0) {
        const actualConversion = Math.min(totalResidentsToConvert, 
                                          Math.max(0, gameState.tourists),
                                          Math.max(0, maxPop - gameState.population));
        if (actualConversion > 0) {
            gameState.population += actualConversion;
            gameState.tourists -= actualConversion;
            addLog(`✓ ${actualConversion} 名游客定居城市`, 'success');
        }
    }
    
    // 更新货物流量影响产业 - 限制增长幅度
    if (totalCargoIn > 0) {
        const industryGrowth = Math.min(1, totalCargoIn * 0.001); // 大幅减缓增长
        gameState.industry.manufacturing = Math.min(100, Math.max(0, gameState.industry.manufacturing + industryGrowth));
    }
    
    return { inflow: totalInflow, outflow: totalOutflow, cargoIn: totalCargoIn, cargoOut: totalCargoOut };
}

/**
 * 模拟公路车辆流量（基于车辆类型）
 */
function simulateHighwayFlow(link, attractiveness, happinessFactor, popPressure) {
    const vehicleTypes = link.vehicleTypes;
    const totalCapacityUnits = link.owned * link.capacity; // 总通行单位
    const flowModifier = attractiveness * happinessFactor * (1 + popPressure * 0.5);
    
    let passengerInflow = 0;
    let passengerOutflow = 0;
    let cargoInflow = 0;
    let cargoOutflow = 0;
    let revenue = 0;
    
    // 计算各车辆类型的流量
    for (const vType in vehicleTypes) {
        const vConfig = vehicleTypes[vType];
        const typeWeight = vConfig.weight;
        
        // 该类型可用的通行单位
        const availableUnits = totalCapacityUnits * typeWeight * link.usageRate * (0.5 + Math.random() * 0.5);
        
        // 计算车辆数量（通行单位 / 每车占用单位）
        const vehicleCount = Math.floor(availableUnits / vConfig.capacityUnits * flowModifier);
        
        // 进城和出城车辆
        const inboundVehicles = Math.floor(vehicleCount * 0.6);
        const outboundVehicles = Math.floor(vehicleCount * 0.4);
        
        if (vType === 'bus') {
            // 大型客车：运载乘客
            passengerInflow += inboundVehicles * vConfig.passengers;
            passengerOutflow += outboundVehicles * vConfig.passengers;
            revenue += (inboundVehicles + outboundVehicles) * (vConfig.ticketPrice + vConfig.tollFee) * 0.8;
        } else if (vType === 'car') {
            // 小型客车：运载乘客（实际乘客数随机）
            const avgPassengers = Math.floor(Math.random() * vConfig.passengers) + 1;
            passengerInflow += inboundVehicles * avgPassengers;
            passengerOutflow += outboundVehicles * avgPassengers;
            revenue += (inboundVehicles + outboundVehicles) * (vConfig.ticketPrice + vConfig.tollFee) * 0.8;
        } else if (vType === 'truck') {
            // 货车：运载货物
            cargoInflow += inboundVehicles * vConfig.cargoCapacity;
            cargoOutflow += outboundVehicles * vConfig.cargoCapacity;
            revenue += (inboundVehicles + outboundVehicles) * vConfig.tollFee * 0.8;
        }
    }
    
    return {
        passengerInflow,
        passengerOutflow,
        cargoInflow,
        cargoOutflow,
        revenue
    };
}

/**
 * 月度结算：重置流量统计、扣除维护费
 */
function processExternalLinksMonthEnd() {
    const links = gameState.externalLinks;
    let totalMaintenanceCost = 0;
    let totalRevenue = 0;
    let totalUsers = 0;
    
    for (const type in links) {
        const link = links[type];
        
        // 计算维护费用
        const maintenanceCost = link.owned * link.maintenanceCost;
        totalMaintenanceCost += maintenanceCost;
        
        // 扣除维护费
        if (maintenanceCost > 0) {
            gameState.money -= maintenanceCost;
        }
        
        // 记录月度统计
        totalRevenue += link.monthlyRevenue;
        totalUsers += link.monthlyUsers;
        
        // 重置月度统计
        link.monthlyUsers = 0;
        link.monthlyRevenue = 0;
    }
    
    if (totalUsers > 0) {
        addLog(`✦ 本月外部链接：客流 ${totalUsers.toLocaleString()} 人次，收入 ${totalRevenue.toLocaleString()}，维护费 ${totalMaintenanceCost.toLocaleString()}`, 'info');
    }
    
    return {
        maintenanceCost: totalMaintenanceCost,
        revenue: totalRevenue,
        users: totalUsers
    };
}

/**
 * 调整外部链接价格
 */
function setLinkPrice(type, priceType, value) {
    const link = gameState.externalLinks[type];
    if (!link) {
        addLog('✗ 无效的链接类型', 'error');
        return false;
    }
    
    if (priceType === 'ticket') {
        link.ticketPrice = Math.max(1, Math.min(1000, value));
        addLog(`已设置 ${getLinkName(type)} 车票价为 ${link.ticketPrice}`, 'info');
    } else if (priceType === 'toll') {
        link.tollFee = Math.max(0, Math.min(500, value));
        addLog(`已设置 ${getLinkName(type)} 过路费为 ${link.tollFee}`, 'info');
    }
    
    return true;
}

/**
 * 获取外部链接概览数据
 */
function getExternalLinksOverview() {
    const links = gameState.externalLinks;
    const overview = [];
    
    for (const type in links) {
        const link = links[type];
        overview.push({
            type,
            name: getLinkName(type),
            owned: link.owned,
            capacity: link.owned * link.capacity,
            ticketPrice: link.ticketPrice,
            tollFee: link.tollFee,
            maintenanceCost: link.owned * link.maintenanceCost,
            monthlyUsers: link.monthlyUsers,
            monthlyRevenue: link.monthlyRevenue,
            totalRevenue: link.totalRevenue,
            buyCost: link.buyCost
        });
    }
    
    return overview;
}

// ==================== 实时模拟 ====================

/**
 * 时间推进：现实1秒 = 游戏30分钟
 */
function simulateTime() {
    try {
        // 防御性检查：确保gameState存在且有效
        if (!gameState || typeof gameState !== 'object') {
            console.error('simulateTime: gameState is invalid');
            return;
        }
        
        // 根据速度调整推进量
        const minutesPerTick = 30;
        gameState.minute += minutesPerTick;
        
        // 实时数据更新（每tick）
        simulateRealTime(minutesPerTick);
        
        // 处理时间溢出 - 使用while确保多次溢出都被正确处理
        
        // 处理分钟溢出
        while (gameState.minute >= 60) {
            gameState.minute -= 60;
            gameState.hour++;
            
            // 每小时模拟市民流动
            simulateCitizenFlow();
        }
        
        // 处理小时溢出
        while (gameState.hour >= 24) {
            gameState.hour -= 24;
            gameState.day++;
        }
        
        // 处理天数溢出
        while (gameState.day > getDaysInMonth(gameState.month)) {
            const daysInMonth = getDaysInMonth(gameState.month);
            gameState.day -= daysInMonth;
            gameState.month++;
            
            // 处理月份溢出
            while (gameState.month > 12) {
                gameState.month -= 12;
                gameState.year++;
                addLog(`✦ ${gameState.year}年开始`, 'success');
            }
        }
        
        // 更新UI显示
        if (typeof updateDisplay === 'function') {
            updateDisplay();
        }
        
        // 每月结算
        if (gameState.month !== gameState.lastMonth) {
            gameState.lastMonth = gameState.month;
            // 月度结算：处理外部链接维护费和重置统计
            processExternalLinksMonthEnd();
            simulateMonth();
        }
    } catch (error) {
        console.error('simulateTime error:', error);
        // 尝试恢复时间状态到有效范围
        if (gameState) {
            gameState.minute = Math.max(0, Math.min(59, Math.floor(gameState.minute)));
            gameState.hour = Math.max(0, Math.min(23, Math.floor(gameState.hour)));
            gameState.day = Math.max(1, Math.min(getDaysInMonth(gameState.month), Math.floor(gameState.day)));
            gameState.month = Math.max(1, Math.min(12, Math.floor(gameState.month)));
        }
    }
}

/**
 * 根据住宅区类型计算最大承载人口
 */
function calculateMaxPopulation(zones) {
    // 不同住宅区类型的人口密度（每单位面积容纳人数）
    const densityFactors = {
        lowDensity: 50,    // 低密度：独立房屋，人口密度低
        mediumDensity: 150, // 中密度：多层公寓
        highDensity: 300,   // 高密度：高层公寓
        skyscraper: 600     // 超高层：摩天大楼
    };
    
    const res = zones.residential;
    return res.lowDensity * densityFactors.lowDensity +
           res.mediumDensity * densityFactors.mediumDensity +
           res.highDensity * densityFactors.highDensity +
           res.skyscraper * densityFactors.skyscraper;
}

/**
 * 计算工业就业人口
 * 基于库兹涅茨法则：工业化初期就业占比上升，后期下降
 * 考虑技术进步对就业的挤出效应
 */
function calculateIndustryEmployment() {
    const industry = gameState.industry;
    const tech = gameState.technology;
    const zones = gameState.zones;
    
    // 1. 计算劳动力总量（适龄劳动人口）
    // 假设劳动力参与率约65%，但受老龄化影响
    const agingFactor = Math.max(0.5, 1 - (gameState.elders / Math.max(1, gameState.population)) * 0.5);
    const totalLaborForce = Math.floor(gameState.population * 0.65 * agingFactor);
    
    // 2. 计算技术进步对劳动生产率的影响
    // 自动化水平越高，单位产业规模需要的工人越少
    const automationEffect = Math.max(0.3, 1 - tech.automationLevel / 200); // 最低保留30%就业
    tech.laborProductivity = 1 + tech.automationLevel / 50;
    
    // 3. 产业类型差异化就业弹性系数
    // 不同产业对劳动力的吸纳能力不同
    const employmentElasticity = {
        manufacturing: 15,    // 制造业：劳动密集型，每单位产业规模需要较多工人
        heavyIndustry: 8,     // 重工业：资本密集型，需要较少工人
        hiTech: 5             // 高新技术产业：技术密集型，需要最少工人但要求高技能
    };
    
    // 4. 计算各产业就业人口
    // 就业人口 = 产业规模 × 就业弹性 × 自动化影响 × 工业区面积系数
    const industrialAreaFactor = Math.max(0.5, zones.industrial / 20); // 工业区面积影响
    
    const manufacturingWorkers = Math.floor(
        industry.manufacturing * employmentElasticity.manufacturing * 
        automationEffect * industrialAreaFactor
    );
    
    const heavyIndustryWorkers = Math.floor(
        industry.heavyIndustry * employmentElasticity.heavyIndustry * 
        automationEffect * industrialAreaFactor
    );
    
    const hiTechWorkers = Math.floor(
        industry.hiTech * employmentElasticity.hiTech * 
        automationEffect * industrialAreaFactor * 1.5 // 高新技术产业有额外人才吸引力
    );
    
    const totalIndustryWorkers = manufacturingWorkers + heavyIndustryWorkers + hiTechWorkers;
    
    // 5. 计算工业就业占劳动力比例（库兹涅茨倒U型曲线）
    // 工业化初期比例上升，后期下降
    const industrializationStage = Math.min(1, totalIndustryWorkers / Math.max(1, totalLaborForce));
    const kuznetsRatio = Math.sin(industrializationStage * Math.PI) * 100; // 倒U型曲线
    
    // 6. 更新工业就业数据
    gameState.industryEmployment = {
        manufacturing: manufacturingWorkers,
        heavyIndustry: heavyIndustryWorkers,
        hiTech: hiTechWorkers,
        total: totalIndustryWorkers,
        ratio: Math.min(100, (totalIndustryWorkers / Math.max(1, totalLaborForce)) * 100)
    };
    
    // 7. 更新劳动力市场数据
    const serviceWorkers = Math.floor(gameState.service * 10 * automationEffect); // 服务业就业
    const commerceWorkers = Math.floor(gameState.commerce * 8 * automationEffect); // 商业就业
    const agricultureWorkers = Math.floor(gameState.agriculture * 12 * automationEffect); // 农业就业
    
    const totalEmployed = totalIndustryWorkers + serviceWorkers + commerceWorkers + agricultureWorkers;
    const unemployed = Math.max(0, totalLaborForce - totalEmployed);
    const unemploymentRate = Math.min(100, (unemployed / Math.max(1, totalLaborForce)) * 100);
    
    // 8. 技能结构计算（基于教育和产业类型）
    const educationFactor = gameState.education / 100;
    const hiTechDemand = industry.hiTech * 0.3; // 高新技术对高技能劳动力需求
    
    const highSkillWorkers = Math.floor(totalLaborForce * (0.1 + educationFactor * 0.3 + hiTechDemand * 0.01));
    const mediumSkillWorkers = Math.floor(totalLaborForce * (0.3 + educationFactor * 0.2));
    const lowSkillWorkers = Math.max(0, totalLaborForce - highSkillWorkers - mediumSkillWorkers);
    
    gameState.laborMarket = {
        totalLaborForce: totalLaborForce,
        employed: totalEmployed,
        unemployed: unemployed,
        unemploymentRate: unemploymentRate,
        skillLevels: {
            high: highSkillWorkers,
            medium: mediumSkillWorkers,
            low: lowSkillWorkers
        }
    };
    
    // 9. 更新失业率
    gameState.unemployedRate = unemploymentRate;
    
    return gameState.industryEmployment;
}

/**
 * 更新技术进步和自动化水平
 */
function updateTechnology() {
    const pv = gameState.policyValues;
    const industry = gameState.industry;
    
    // 技术进步受科技投资、高新技术产业规模和教育水平影响
    const techInvestment = pv.educationInvest * 0.01 + pv.industrialUpgrade * 0.005;
    const hiTechBonus = industry.hiTech * 0.01;
    const educationBonus = gameState.education * 0.001;
    
    // 技术进步指数累积
    gameState.technology.techProgress += techInvestment + hiTechBonus + educationBonus;
    gameState.technology.techProgress = Math.min(100, gameState.technology.techProgress);
    
    // 自动化水平随技术进步提升，但受政策调控
    const automationTarget = gameState.technology.techProgress * 0.8; // 自动化水平最高为技术进步的80%
    const policyConstraint = Math.max(0.2, 1 - pv.minWage * 0.01); // 高最低工资会减缓自动化
    
    gameState.technology.automationLevel = Math.min(100, automationTarget * policyConstraint);
}

/**
 * 实时数据更新（每tick）
 */
function simulateRealTime(minutes) {
    const pv = gameState.policyValues;
    const power = gameState.powerGeneration;
    
    // 定义城市吸引力和幸福度因子（在整个函数中使用）
    const attractiveness = gameState.cityAttractiveness / 100;
    const happinessFactor = gameState.happiness / 100;
    
    // 更新发电量数据（确保设施购买后数据同步）
    updatePowerGeneration();
    
    // 计算能源需求
    const industryValue = typeof gameState.industry === 'object' ? 
        gameState.industry.manufacturing + gameState.industry.heavyIndustry + gameState.industry.hiTech : 
        (gameState.industry || 0);
    const baseConsumption = 80 + gameState.population / 100 + industryValue * 0.5;
    
    // 太阳能发电：白天效率高，夜晚效率低
    const solarEfficiency = gameState.hour >= 6 && gameState.hour <= 18 ? 1.2 : 0.2;
    const solarGen = power.solar * solarEfficiency;
    
    // 风力发电：随机波动
    const windEfficiency = Math.random() * 0.4 + 0.8;
    const windGen = power.wind * windEfficiency;
    
    // 总发电量（基础发电 + 可变发电）
    const currentGen = power.coal + power.hydro + Math.floor(solarGen) + Math.floor(windGen) + power.nuclear;
    
    power.consumption = Math.floor(baseConsumption);
    power.total = Math.floor(currentGen);
    
    // 计算能源差额和能源购买支出
    const deficit = power.consumption - power.total;
    if (deficit > 0) {
        power.purchase = deficit;
    } else {
        power.purchase = 0;
    }
    
    // 更新储能
    const energyDiff = power.total + power.purchase - power.consumption;
    power.storage = Math.max(0, Math.min(100, power.storage + energyDiff * 0.1));
    
    // 使用Finance模块计算实时收支
    const finance = Finance.calculateMonthlyBalance(gameState);
    const rates = Finance.calculateRealtimeRates(gameState);
    
    // 计算每分钟的净收入
    const netIncomePerMinute = rates.balancePerMinute;
    
    // 实时更新资金
    gameState.money += netIncomePerMinute * minutes;
    
    // 计算最大承载人口
    const maxPopulation = Math.max(1000, calculateMaxPopulation(gameState.zones));
    
    // 计算人口密度比例（用于人口增长限制）
    const populationDensity = gameState.population / maxPopulation;
    
    // 资源约束检查
    const energyAvailability = power.total / Math.max(1, power.consumption); // 能源供应比例
    const financialHealth = gameState.money > 0 ? 1 : 0.5; // 资金健康度
    
    // 计算实时人口变化率
    // 基础出生率受医疗影响
    const baseBirthRate = gameState.birthRate > 0 ? gameState.birthRate * 0.4 : 0.02; // 如果没有出生率数据，使用默认值
    const healthBonus = (pv.healthcare - 30) * 0.02;
    const birthRate = (baseBirthRate + healthBonus) / 100;
    
    // 死亡率受医疗影响
    const baseDeathRate = gameState.deathRate > 0 ? gameState.deathRate * 0.8 : 0.01;
    const healthReduction = (pv.healthcare - 30) * 0.01;
    const deathRate = Math.max(0.005, (baseDeathRate - healthReduction) / 100);
    
    // 人口增长基础比率
    let popGrowthRate = birthRate - deathRate;
    
    // 人口密度惩罚：人口接近上限时增长放缓
    const densityPenalty = Math.max(0.3, 1 - populationDensity * 0.8);
    popGrowthRate *= densityPenalty;
    
    // 资源约束惩罚
    const resourcePenalty = Math.min(1, Math.max(0.5, (energyAvailability + financialHealth) / 2));
    popGrowthRate *= resourcePenalty;
    
    // 确保增长率合理范围
    popGrowthRate = Math.max(-0.01, Math.min(0.02, popGrowthRate));
    
    // 实时更新人口（每分钟），但不超过最大承载
    // 修复：当人口为0或很低时，使用基础增长而不是乘以人口
    if (gameState.population <= 100) {
        // 新城市：人口从基础开始增长
        const baseGrowth = Math.max(1, Math.round(2 * popGrowthRate * minutes * resourcePenalty));
        gameState.population = Math.min(maxPopulation, gameState.population + baseGrowth);
    } else {
        // 已有人口：正常增长计算
        const popChangePerMinute = gameState.population * popGrowthRate / 43200;
        const newPopulation = gameState.population + popChangePerMinute * minutes;
        gameState.population = Math.max(0, Math.min(maxPopulation, Math.round(newPopulation)));
    }
    
    // 迁入机制：放宽条件，允许新城市迁入
    if (gameState.population < maxPopulation * 0.9 && energyAvailability > 0.3) {
        // 迁入率基于空置率和吸引力
        const vacancyRate = Math.max(0, (maxPopulation - gameState.population) / maxPopulation);
        const migrationRate = vacancyRate * attractiveness * 0.001 * happinessFactor;
        const migration = Math.max(1, Math.round(migrationRate * minutes * 10));
        gameState.population = Math.min(maxPopulation, gameState.population + migration);
    }
    
    // 实时游客增长（自然流入）
    const maxTourists = Math.max(50, maxPopulation * 0.3);
    const touristInflow = Math.round(attractiveness * happinessFactor * minutes * 0.1);
    if (touristInflow > 0) {
        gameState.tourists = Math.min(maxTourists, gameState.tourists + touristInflow);
    }
    
    // 实时游客转居民 - 提高转化率
    if (gameState.tourists > 10 && gameState.population < maxPopulation * 0.95) {
        const vacancyRate = Math.max(0, (maxPopulation - gameState.population) / maxPopulation);
        const conversionChance = attractiveness * 0.0005 * vacancyRate * happinessFactor * resourcePenalty;
        const converted = Math.max(1, Math.floor(gameState.tourists * conversionChance * minutes));
        if (converted > 0) {
            const actualConversion = Math.min(converted, gameState.tourists, maxPopulation - gameState.population);
            if (actualConversion > 0) {
                gameState.population = Math.min(maxPopulation, gameState.population + actualConversion);
                gameState.tourists = Math.max(0, gameState.tourists - actualConversion);
            }
        }
    }
    
    // 存储实时变化率
    gameState.realTime.incomeRate = rates.incomePerMinute;
    gameState.realTime.expenseRate = rates.expensePerMinute;
    gameState.realTime.populationRate = popGrowthRate;
}

/**
 * 月度经济模拟
 */
function simulateMonth() {
    const season = Astronomy.getSeason(gameState.month, gameState.latitude);
    const seasonEffects = {
        '春': { population: 0.3, happiness: 1, tourism: 5 },
        '夏': { happiness: 2, energy: 5, tourism: 15, environment: -1 },
        '秋': { population: 0.2, commerce: 1, happiness: 0.5, tourism: 8 },
        '冬': { happiness: -2, energy: 8, tourism: -10 }
    };
    const effects = seasonEffects[season] || {};
    
    // 计算政策效果
    const pv = gameState.policyValues;
    const avgTaxRate = (pv.taxManufacturing + pv.taxHeavyIndustry + pv.taxHiTech + pv.taxCommerce + pv.taxResidential + pv.taxOffice) / 6;
    const techBonus = pv.techInvest * 0.02;
    const tradeBonus = pv.tradeOpen * 0.01;
    
    // 游客变化（季节和旅游设施影响）- 注意：外部链接带来的游客由simulateCitizenFlow处理
    const maxTourists = Math.max(100, calculateMaxPopulation(gameState.zones) * 0.3);
    const touristChange = Math.floor((effects.tourism || 0) * 2 + pv.greenCity * 0.5 - avgTaxRate * 0.5);
    gameState.tourists = Math.max(0, Math.min(maxTourists, gameState.tourists + touristChange));
    
    // 人口结构更新（基于现有居民的自然增长）
    if (gameState.population > 0) {
        // 动态计算人口结构（考虑老龄化趋势）
        const agingTrend = Math.min(0.3, gameState.year * 0.001); // 随时间缓慢老龄化
        const baseElderRatio = 0.15 + agingTrend;
        const baseWorkerRatio = Math.max(0.5, 0.65 - agingTrend * 0.5);
        
        gameState.elders = Math.floor(gameState.population * baseElderRatio);
        gameState.workers = Math.floor(gameState.population * baseWorkerRatio);
        gameState.children = gameState.population - gameState.workers - gameState.elders;
    } else {
        gameState.workers = 0;
        gameState.elders = 0;
        gameState.children = 0;
    }
    
    // 更新技术进步和自动化水平
    updateTechnology();
    
    // 计算工业就业人口和劳动力市场
    calculateIndustryEmployment();
    
    // 产业板块更新（税率影响）- 限制增长幅度，避免飞涨
    const industry = gameState.industry;
    const techUpgradeBonus = pv.industrialUpgrade * 0.001;
    const energyPenalty = pv.energySaving * 0.0005;
    
    // 限制产业增长因子
    const clampGrowth = (current, delta, maxDelta = 0.5) => {
        return Math.min(100, Math.max(0, current + Math.min(maxDelta, Math.max(-maxDelta, delta))));
    };
    
    // ==================== 工业增长的劳动力约束 ====================
    // 计算劳动力供给对工业增长的限制
    const laborMarket = gameState.laborMarket;
    const industryEmployment = gameState.industryEmployment;
    
    // 可用劳动力 = 劳动力总量 - 已就业人口（其他行业）
    const availableWorkers = Math.max(0, laborMarket.totalLaborForce - laborMarket.employed + industryEmployment.total);
    
    // 工业就业需求 = 当前工业规模 * 就业弹性系数
    const employmentElasticity = {
        manufacturing: 15,
        heavyIndustry: 8,
        hiTech: 5
    };
    
    // 当前工业总就业需求
    const currentEmploymentNeed = 
        industry.manufacturing * employmentElasticity.manufacturing +
        industry.heavyIndustry * employmentElasticity.heavyIndustry +
        industry.hiTech * employmentElasticity.hiTech;
    
    // 劳动力约束因子：当劳动力不足时，工业增长受限
    // 如果当前就业需求已经超过可用劳动力的80%，工业增长开始受限
    const laborConstraint = Math.min(1, Math.max(0.1, availableWorkers / (currentEmploymentNeed * 0.8)));
    
    // 老龄化约束因子：老龄化严重时，劳动力供给减少
    const agingRatio = gameState.elders / Math.max(1, gameState.population);
    const agingConstraint = Math.min(1, 1 - agingRatio * 0.5); // 老龄化越严重，约束越强
    
    // 综合约束因子
    const industryGrowthConstraint = laborConstraint * agingConstraint;
    
    // ==================== 产业板块更新（考虑劳动力约束）====================
    
    // 制造业：受最低工资、工业园区建设和劳动力约束影响
    const manufDelta = (techBonus * 0.1 + pv.industrialZone * 0.0002 - pv.taxManufacturing * 0.01 - techUpgradeBonus) * industryGrowthConstraint;
    industry.manufacturing = clampGrowth(industry.manufacturing, manufDelta, 0.3);
    
    // 重工业：受节能减排政策、绿化政策和劳动力约束影响
    const heavyDelta = (pv.roadBuild * 0.0002 - pv.taxHeavyIndustry * 0.01 - pv.greenCity * 0.001 - energyPenalty) * industryGrowthConstraint;
    industry.heavyIndustry = clampGrowth(industry.heavyIndustry, heavyDelta, 0.3);
    
    // 高新技术产业：受科技投资、产业升级政策和劳动力约束影响
    // 高新技术产业对高技能人才有额外需求
    const skillConstraint = laborMarket.skillLevels.high > 0 ? 
        Math.min(1, laborMarket.skillLevels.high / Math.max(1, industry.hiTech * 3)) : 0.3;
    const hiTechDelta = (techBonus * 0.2 + pv.industrialUpgrade * 0.0003 - pv.taxHiTech * 0.005) * industryGrowthConstraint * skillConstraint;
    industry.hiTech = clampGrowth(industry.hiTech, hiTechDelta, 0.3);
    
    // 商业和服务
    const commerceDelta = tradeBonus * 0.3 + pv.minWage * 0.01 - pv.taxCommerce * 0.01;
    gameState.commerce = clampGrowth(gameState.commerce, commerceDelta, 0.3);
    
    const serviceDelta = pv.healthcare * 0.02 + pv.educationInvest * 0.01 - pv.taxOffice * 0.01;
    gameState.service = clampGrowth(gameState.service, serviceDelta, 0.3);
    
    gameState.agriculture = clampGrowth(gameState.agriculture, (Math.random() - 0.5) * 0.2, 0.2);
    
    const tourismDelta = pv.greenCity * 0.03 + pv.housing * 0.01 - pv.taxCommerce * 0.005;
    gameState.tourism = clampGrowth(gameState.tourism, tourismDelta, 0.3);
    
    // 经济数据更新（使用工业细分计算GDP）- 修复GDP计算逻辑
    const industryTotal = industry.manufacturing + industry.heavyIndustry + industry.hiTech;
    const commerceValue = gameState.commerce;
    const serviceValue = gameState.service;
    const tourismValue = gameState.tourism;
    
    // GDP基于人口和产业活动计算
    const popFactor = gameState.population > 0 ? gameState.population : 1;
    const industryFactor = industryTotal * 0.5;
    const commerceFactor = commerceValue * 0.3;
    const serviceFactor = serviceValue * 0.2;
    const tourismFactor = tourismValue * 0.1;
    
    // 基础GDP = 人口 * 产业活动系数
    const baseGdp = popFactor * (1 + industryFactor + commerceFactor + serviceFactor + tourismFactor) / 100;
    
    // 增长率调整
    const growthFactor = 1 + (gameState.growth + techBonus * 10 + tradeBonus * 10) / 100;
    gameState.gdp = Math.floor(Math.max(100, baseGdp * growthFactor));
    
    // 增长率更新
    const growthDelta = techBonus * 0.5 + tradeBonus * 0.5 - avgTaxRate * 0.01 + (gameState.population > 100 ? 0.1 : 0);
    gameState.growth = clampGrowth(gameState.growth, growthDelta, 0.5);
    
    gameState.inflation = Math.min(8, Math.max(-2, gameState.inflation + pv.minWage * 0.001 - avgTaxRate * 0.001));
    gameState.energy = Math.floor(100 + gameState.population / 1000 + (effects.energy || 0) * 0.1);
    
    // 城市指标更新（税率影响幸福度）
    gameState.happiness = Math.min(100, Math.max(0, gameState.happiness + (effects.happiness || 0) * 0.1 + pv.welfare * 0.01 + pv.greenCity * 0.01 - pv.taxResidential * 0.015));
    gameState.education = Math.min(100, Math.max(0, gameState.education + pv.educationInvest * 0.01));
    gameState.health = Math.min(100, Math.max(0, gameState.health + pv.healthcare * 0.01));
    // 环境：重工业是主要污染源
    gameState.environment = Math.min(100, Math.max(0, gameState.environment + pv.greenCity * 0.02 - industry.heavyIndustry * gameState.zones.industrial * 0.0008));
    gameState.safety = Math.min(100, Math.max(0, gameState.safety + pv.police * 0.01));
    
    // 城市需求更新 - 与人口和产业活动贴合
    const industryDemand = industryTotal * 0.3; // 工业需求
    
    // 基础需求：与人口正相关
    const basicTarget = Math.min(100, 20 + popFactor / 50 + industryDemand);
    gameState.basicDemand = clampGrowth(gameState.basicDemand, (basicTarget - gameState.basicDemand) * 0.05, 1);
    
    // 发展需求：与人口、教育和高新技术正相关
    const developTarget = Math.min(100, 20 + popFactor / 100 + pv.educationInvest * 0.5 + industry.hiTech * 0.2);
    gameState.developDemand = clampGrowth(gameState.developDemand, (developTarget - gameState.developDemand) * 0.05, 1);
    
    // 休闲需求：与人口、绿化和旅游业正相关
    const leisureTarget = Math.min(100, 10 + popFactor / 200 + pv.greenCity * 0.3 + tourismValue * 0.1);
    gameState.leisureDemand = clampGrowth(gameState.leisureDemand, (leisureTarget - gameState.leisureDemand) * 0.05, 1);
    
    // 城市功能区占比更新（政策影响）- 限制增长幅度
    // 绿地：根据绿化建设政策变化
    gameState.zones.green = clampGrowth(gameState.zones.green, (pv.greenCity - 30) * 0.002, 0.2);
    gameState.zones.green = Math.min(40, Math.max(5, gameState.zones.green));
    // 工业：根据道路建设和绿化政策变化 - 大幅减缓增长
    gameState.zones.industrial = clampGrowth(gameState.zones.industrial, -pv.greenCity * 0.001 + pv.roadBuild * 0.0005, 0.1);
    gameState.zones.industrial = Math.min(50, Math.max(10, gameState.zones.industrial));
    // 商业：根据贸易开放度变化
    gameState.zones.commercial = clampGrowth(gameState.zones.commercial, pv.tradeOpen * 0.001, 0.1);
    gameState.zones.commercial = Math.min(40, Math.max(10, gameState.zones.commercial));
    // 住宅区各密度类型更新（根据住房建设政策变化）
    const res = gameState.zones.residential;
    const housingBonus = pv.housing * 0.0005;
    res.lowDensity = clampGrowth(res.lowDensity, housingBonus, 0.1);
    res.lowDensity = Math.min(30, Math.max(5, res.lowDensity));
    res.mediumDensity = clampGrowth(res.mediumDensity, housingBonus * 1.2, 0.1);
    res.mediumDensity = Math.min(25, Math.max(3, res.mediumDensity));
    res.highDensity = clampGrowth(res.highDensity, housingBonus * 0.8, 0.1);
    res.highDensity = Math.min(15, Math.max(1, res.highDensity));
    res.skyscraper = clampGrowth(res.skyscraper, housingBonus * 0.3, 0.1);
    res.skyscraper = Math.min(10, Math.max(0, res.skyscraper));
    // 公共设施：根据医疗和教育投入变化
    gameState.zones.public = clampGrowth(gameState.zones.public, (pv.healthcare + pv.educationInvest) * 0.0005, 0.1);
    gameState.zones.public = Math.min(25, Math.max(5, gameState.zones.public));
    
    // 确保总和为100
    const totalResidential = res.lowDensity + res.mediumDensity + res.highDensity + res.skyscraper;
    const total = totalResidential + gameState.zones.commercial + gameState.zones.industrial + gameState.zones.green + gameState.zones.public;
    if (total !== 100) {
        const scale = 100 / total;
        res.lowDensity = Math.round(res.lowDensity * scale);
        res.mediumDensity = Math.round(res.mediumDensity * scale);
        res.highDensity = Math.round(res.highDensity * scale);
        res.skyscraper = Math.round(res.skyscraper * scale);
        gameState.zones.commercial = Math.round(gameState.zones.commercial * scale);
        gameState.zones.industrial = Math.round(gameState.zones.industrial * scale);
        gameState.zones.green = Math.round(gameState.zones.green * scale);
        // 公共设施最后调整以确保总和为100
        const newTotalResidential = res.lowDensity + res.mediumDensity + res.highDensity + res.skyscraper;
        gameState.zones.public = 100 - newTotalResidential - gameState.zones.commercial - gameState.zones.industrial - gameState.zones.green;
    }
    
    // 能源消耗计算
    const industryValue2 = typeof gameState.industry === 'object' ? 
        gameState.industry.manufacturing + gameState.industry.heavyIndustry + gameState.industry.hiTech : 
        (gameState.industry || 0);
    const baseConsumption = 80 + gameState.population / 100 + industryValue2 * 0.5;
    const solarGen = gameState.powerGeneration.solar * (season === '夏' ? 1.3 : season === '冬' ? 0.7 : 1);
    const windGen = gameState.powerGeneration.wind * (Math.random() * 0.4 + 0.8);
    
    gameState.powerGeneration.total = Math.floor(
        gameState.powerGeneration.coal + 
        gameState.powerGeneration.hydro + 
        solarGen + 
        windGen + 
        gameState.powerGeneration.nuclear
    );
    gameState.powerGeneration.consumption = Math.floor(baseConsumption);
    
    // 更新储能
    const energyDiff = gameState.powerGeneration.total - gameState.powerGeneration.consumption;
    gameState.powerGeneration.storage = Math.max(0, Math.min(100, gameState.powerGeneration.storage + energyDiff * 0.1));
    
    // 建设进度更新（与预算挂钩）
    const budgetMultiplier = Math.min(2, gameState.budget.total / 5000);
    
    // 绿化建设
    gameState.construction.greenCity.progress += (gameState.budget.environment / 500) * budgetMultiplier;
    if (gameState.construction.greenCity.progress >= 100) {
        gameState.construction.greenCity.progress = 100;
        gameState.zones.green = Math.min(40, gameState.zones.green + 5);
        gameState.environment += 5;
        addLog('✓ 绿化建设完成！绿地面积增加', 'success');
        gameState.construction.greenCity.progress = 0;
    }
    
    // 道路建设
    gameState.construction.roads.progress += (gameState.budget.infrastructure / 1000) * budgetMultiplier;
    if (gameState.construction.roads.progress >= 100) {
        gameState.construction.roads.progress = 100;
        // 道路建设完成，提升制造业和重工业（而不是直接修改整个industry对象）
        gameState.industry.manufacturing = Math.min(100, gameState.industry.manufacturing + 1);
        gameState.industry.heavyIndustry = Math.min(100, gameState.industry.heavyIndustry + 1);
        addLog('✓ 道路建设完成！工业效率提升', 'success');
        gameState.construction.roads.progress = 0;
    }
    
    // 住房建设
    gameState.construction.housing.progress += (gameState.budget.infrastructure / 1500) * budgetMultiplier;
    if (gameState.construction.housing.progress >= 100) {
        gameState.construction.housing.progress = 100;
        // 根据当前发展水平决定新增住宅区类型
        const res = gameState.zones.residential;
        const totalResidential = res.lowDensity + res.mediumDensity + res.highDensity + res.skyscraper;
        
        // 优先增加中密度住宅区，其次根据城市规模决定
        if (gameState.population < 5000) {
            res.lowDensity = Math.min(30, res.lowDensity + 3);
            res.mediumDensity = Math.min(25, res.mediumDensity + 2);
        } else if (gameState.population < 15000) {
            res.mediumDensity = Math.min(25, res.mediumDensity + 3);
            res.highDensity = Math.min(15, res.highDensity + 1);
        } else if (gameState.population < 30000) {
            res.highDensity = Math.min(15, res.highDensity + 3);
            res.skyscraper = Math.min(10, res.skyscraper + 1);
        } else {
            res.skyscraper = Math.min(10, res.skyscraper + 2);
            res.highDensity = Math.min(15, res.highDensity + 2);
        }
        
        addLog('✓ 住房建设完成！住宅区面积增加', 'success');
        gameState.construction.housing.progress = 0;
    }
    
    // 发电厂建设
    gameState.construction.powerPlant.progress += (gameState.budget.infrastructure / 2000) * budgetMultiplier;
    if (gameState.construction.powerPlant.progress >= 100) {
        gameState.construction.powerPlant.progress = 100;
        gameState.powerGeneration.solar += 20;
        addLog('✓ 太阳能发电厂建设完成！发电量增加', 'success');
        gameState.construction.powerPlant.progress = 0;
    }
    
    // 医院建设
    gameState.construction.hospital.progress += (gameState.budget.healthcare / 800) * budgetMultiplier;
    if (gameState.construction.hospital.progress >= 100) {
        gameState.construction.hospital.progress = 100;
        gameState.health += 8;
        gameState.deathRate -= 0.1;
        addLog('✓ 医院建设完成！医疗水平提升', 'success');
        gameState.construction.hospital.progress = 0;
    }
    
    // 学校建设
    gameState.construction.school.progress += (gameState.budget.education / 600) * budgetMultiplier;
    if (gameState.construction.school.progress >= 100) {
        gameState.construction.school.progress = 100;
        gameState.education += 8;
        gameState.growth += 0.5;
        addLog('✓ 学校建设完成！教育水平提升', 'success');
        gameState.construction.school.progress = 0;
    }
    
    // 随机事件
    if (Math.random() < 0.15) triggerRandomEvent();
    
    // 更新显示
    updateDisplay();
}

/**
 * 触发随机事件
 */
function triggerRandomEvent() {
    const events = [
        { msg: '✦ 节日庆典！幸福度提升', effect: () => { gameState.happiness += 8; gameState.tourists += 200; } },
        { msg: '◇ 经济波动', effect: () => { gameState.growth -= 0.3; } },
        { msg: '◆ 新企业入驻', effect: () => { gameState.commerce += 5; gameState.money += 1000; } },
        { msg: '✚ 医疗突破', effect: () => { gameState.health += 5; gameState.happiness += 3; } },
        { msg: '◇ 小型事故', effect: () => { gameState.money -= 800; gameState.happiness -= 2; } },
        { msg: '✎ 教育成果', effect: () => { gameState.education += 3; } },
        { msg: '❋ 环保成效', effect: () => { gameState.environment += 3; gameState.tourists += 100; } },
        { msg: '◈ 治安专项行动', effect: () => { gameState.safety += 3; } },
        { msg: '☀ 旅游旺季来临', effect: () => { gameState.tourists += 500; gameState.commerce += 3; } },
        { msg: '☾ 旅游淡季', effect: () => { gameState.tourists -= 200; } }
    ];
    const event = events[Math.floor(Math.random() * events.length)];
    event.effect();
    addLog(event.msg, 'event');
}

// ==================== 服务设施系统 ====================

/**
 * 购买服务设施
 * @param {string} category - 设施类别：power, services, commercial
 * @param {string} facilityId - 设施ID
 * @returns {boolean} - 是否购买成功
 */
function buyFacility(category, facilityId) {
    const categoryData = gameState.facilities[category];
    if (!categoryData) {
        addLog('✗ 无效的设施类别', 'error');
        return false;
    }
    
    const facility = categoryData[facilityId];
    if (!facility) {
        addLog('✗ 无效的设施类型', 'error');
        return false;
    }
    
    const cost = facility.baseCost;
    if (gameState.money < cost) {
        addLog(`✗ 资金不足，购买${facility.name}需要 ${cost.toLocaleString()} 元`, 'warning');
        return false;
    }
    
    // 原子事务处理
    gameState.money -= cost;
    facility.owned = 1;
    facility.currentLevel = 1;
    
    // 如果是发电设施，更新能源供应
    if (category === 'power') {
        updatePowerGeneration();
    }
    
    // 如果是服务设施或商业设施，更新能源消耗
    if (category === 'services' || category === 'commercial') {
        updateEnergyConsumption();
    }
    
    addLog(`✓ 成功购买${facility.name}`, 'success');
    return true;
}

/**
 * 升级服务设施
 * @param {string} category - 设施类别
 * @param {string} facilityId - 设施ID
 * @returns {boolean} - 是否升级成功
 */
function upgradeFacility(category, facilityId) {
    const categoryData = gameState.facilities[category];
    if (!categoryData) {
        addLog('✗ 无效的设施类别', 'error');
        return false;
    }
    
    const facility = categoryData[facilityId];
    if (!facility) {
        addLog('✗ 无效的设施类型', 'error');
        return false;
    }
    
    if (facility.owned === 0) {
        addLog('✗ 未购买该设施', 'warning');
        return false;
    }
    
    if (facility.currentLevel >= facility.maxLevel) {
        addLog('✗ 已达到最高等级', 'warning');
        return false;
    }
    
    const nextLevel = facility.currentLevel;
    const upgradeCost = facility.upgradeCost[nextLevel];
    
    if (gameState.money < upgradeCost) {
        addLog(`✗ 资金不足，升级到${nextLevel + 1}级需要 ${upgradeCost.toLocaleString()} 元`, 'warning');
        return false;
    }
    
    // 原子事务处理
    gameState.money -= upgradeCost;
    facility.currentLevel++;
    
    // 更新设施属性
    if (facility.upgradeOutput) {
        facility.energyOutput = facility.upgradeOutput[facility.currentLevel - 1];
    }
    if (facility.upgradeMaintenance) {
        facility.baseMaintenance = facility.upgradeMaintenance[facility.currentLevel - 1];
    }
    if (facility.upgradeEnergy) {
        facility.energyConsumption = facility.upgradeEnergy[facility.currentLevel - 1];
    }
    if (facility.upgradeCoverage) {
        facility.coverage = facility.upgradeCoverage[facility.currentLevel - 1];
    }
    if (facility.upgradeEffect) {
        facility.effectValue = facility.upgradeEffect[facility.currentLevel - 1];
    }
    if (facility.upgradeRevenue) {
        facility.revenue = facility.upgradeRevenue[facility.currentLevel - 1];
    }
    
    // 更新能源数据
    if (category === 'power') {
        updatePowerGeneration();
    } else {
        updateEnergyConsumption();
    }
    
    addLog(`✓ ${facility.name}升级到${facility.currentLevel}级`, 'success');
    return true;
}

/**
 * 更新发电总量
 */
function updatePowerGeneration() {
    const powerFacilities = gameState.facilities.power;
    const pg = gameState.powerGeneration;
    
    // 更新各类型发电量
    pg.coal = powerFacilities.coalPlant.owned > 0 ? 
        Math.round(powerFacilities.coalPlant.energyOutput * powerFacilities.coalPlant.efficiency * powerFacilities.coalPlant.owned) : 0;
    pg.hydro = powerFacilities.hydroPlant.owned > 0 ? 
        Math.round(powerFacilities.hydroPlant.energyOutput * powerFacilities.hydroPlant.efficiency * powerFacilities.hydroPlant.owned) : 0;
    pg.solar = powerFacilities.solarPlant.owned > 0 ? 
        Math.round(powerFacilities.solarPlant.energyOutput * powerFacilities.solarPlant.owned) : 0;
    pg.wind = powerFacilities.windFarm.owned > 0 ? 
        Math.round(powerFacilities.windFarm.energyOutput * powerFacilities.windFarm.owned) : 0;
    pg.nuclear = powerFacilities.nuclearPlant.owned > 0 ? 
        Math.round(powerFacilities.nuclearPlant.energyOutput * powerFacilities.nuclearPlant.efficiency * powerFacilities.nuclearPlant.owned) : 0;
    
    // 计算总发电量
    pg.total = pg.coal + pg.hydro + pg.nuclear;
}

/**
 * 更新能源消耗
 */
function updateEnergyConsumption() {
    let totalConsumption = 0;
    
    // 计算服务设施能耗
    Object.keys(gameState.facilities.services).forEach(key => {
        const facility = gameState.facilities.services[key];
        if (facility.owned > 0) {
            totalConsumption += facility.energyConsumption;
        }
    });
    
    // 计算商业设施能耗
    Object.keys(gameState.facilities.commercial).forEach(key => {
        const facility = gameState.facilities.commercial[key];
        if (facility.owned > 0) {
            totalConsumption += facility.energyConsumption;
        }
    });
    
    // 计算居民建筑能耗（按人口计算）
    totalConsumption += Math.floor(gameState.population / 100);
    
    gameState.powerGeneration.consumption = totalConsumption;
}

/**
 * 购买市外电力
 * @param {number} amount - 购买的电量（千瓦时）
 * @returns {boolean} - 是否购买成功
 */
function buyExternalPower(amount) {
    const power = gameState.powerGeneration;
    const pricePerKWh = power.purchasePrice || 10; // 固定单价：10元/千瓦时
    
    // 验证购买量
    if (amount <= 0) {
        addLog('✗ 购买电量必须大于0', 'warning');
        return false;
    }
    
    // 计算总成本
    const totalCost = amount * pricePerKWh;
    
    // 检查资金是否充足
    if (gameState.money < totalCost) {
        addLog(`✗ 资金不足，购买 ${amount} 千瓦时电力需要 ${totalCost.toLocaleString()} 元`, 'warning');
        return false;
    }
    
    // 执行购买
    gameState.money -= totalCost;
    power.purchase += amount;
    
    addLog(`✓ 成功购买 ${amount} 千瓦时市外电力，花费 ${totalCost.toLocaleString()} 元`, 'success');
    return true;
}

/**
 * 监控能源状态并触发预警
 */
function monitorEnergyStatus() {
    const supply = gameState.powerGeneration.total;
    const consumption = gameState.powerGeneration.consumption;
    
    let alertLevel = 0;
    
    if (consumption === 0) {
        alertLevel = 0;
    } else if (supply === 0) {
        alertLevel = 3; // 危急：完全没有电力
    } else if (supply < consumption * 0.3) {
        alertLevel = 3; // 危急：电力严重不足
    } else if (supply < consumption * 0.5) {
        alertLevel = 2; // 严重：电力不足
    } else if (supply < consumption * 0.8) {
        alertLevel = 1; // 警告：电力紧张
    }
    
    gameState.energyAlert.level = alertLevel;
    gameState.energyAlert.active = alertLevel > 0;
    
    if (alertLevel > 0) {
        gameState.energyAlert.lastAlertTime = Date.now();
        // 触发视觉预警
        triggerEnergyAlert(alertLevel);
    }
    
    return alertLevel;
}

/**
 * 触发能源预警
 */
function triggerEnergyAlert(level) {
    const alertMessages = [
        '',
        '⚠️ 电力紧张！当前发电量接近满载',
        '⚡ 电力不足！部分设施性能下降',
        '🔥 电力危急！重要设施优先供电'
    ];
    
    if (level > 0 && level <= 3) {
        addLog(alertMessages[level], 'warning');
    }
    
    // 更新能源效率（电力不足时降低）
    if (level >= 2) {
        // 降低所有设施效率
        Object.keys(gameState.facilities.services).forEach(key => {
            gameState.facilities.services[key].efficiency = 0.5;
        });
        Object.keys(gameState.facilities.commercial).forEach(key => {
            gameState.facilities.commercial[key].efficiency = 0.5;
        });
    } else {
        // 恢复效率
        Object.keys(gameState.facilities.services).forEach(key => {
            gameState.facilities.services[key].efficiency = 1.0;
        });
        Object.keys(gameState.facilities.commercial).forEach(key => {
            gameState.facilities.commercial[key].efficiency = 1.0;
        });
    }
}

/**
 * 计算设施维护总成本
 */
function calculateFacilityMaintenanceCost() {
    let totalCost = 0;
    
    // 发电设施维护成本
    Object.keys(gameState.facilities.power).forEach(key => {
        const facility = gameState.facilities.power[key];
        if (facility.owned > 0) {
            totalCost += facility.baseMaintenance * facility.owned;
        }
    });
    
    // 服务设施维护成本
    Object.keys(gameState.facilities.services).forEach(key => {
        const facility = gameState.facilities.services[key];
        if (facility.owned > 0) {
            totalCost += facility.baseMaintenance * facility.owned;
        }
    });
    
    // 商业设施维护成本
    Object.keys(gameState.facilities.commercial).forEach(key => {
        const facility = gameState.facilities.commercial[key];
        if (facility.owned > 0) {
            totalCost += facility.baseMaintenance * facility.owned;
        }
    });
    
    return totalCost;
}

/**
 * 计算设施总收益
 */
function calculateFacilityRevenue() {
    let totalRevenue = 0;
    
    // 商业设施收益
    Object.keys(gameState.facilities.commercial).forEach(key => {
        const facility = gameState.facilities.commercial[key];
        if (facility.owned > 0) {
            totalRevenue += facility.revenue * facility.efficiency;
        }
    });
    
    return totalRevenue;
}

/**
 * 获取设施概述
 */
function getFacilitiesOverview() {
    const overview = {
        power: {
            totalOutput: gameState.powerGeneration.total,
            facilities: []
        },
        services: {
            facilities: []
        },
        commercial: {
            facilities: []
        },
        totalMaintenance: calculateFacilityMaintenanceCost(),
        totalRevenue: calculateFacilityRevenue()
    };
    
    Object.keys(gameState.facilities.power).forEach(key => {
        const facility = gameState.facilities.power[key];
        overview.power.facilities.push({
            id: key,
            ...facility
        });
    });
    
    Object.keys(gameState.facilities.services).forEach(key => {
        const facility = gameState.facilities.services[key];
        overview.services.facilities.push({
            id: key,
            ...facility
        });
    });
    
    Object.keys(gameState.facilities.commercial).forEach(key => {
        const facility = gameState.facilities.commercial[key];
        overview.commercial.facilities.push({
            id: key,
            ...facility
        });
    });
    
    return overview;
}

/**
 * 添加日志
 */
function addLog(message, type = '') {
    const logList = document.getElementById('logList');
    if (!logList) return;
    const logItem = document.createElement('div');
    logItem.className = `log-item ${type}`;
    logItem.innerHTML = `<span class="log-time">第${gameState.year}年${gameState.month}月${gameState.day}日</span> ${message}`;
    logList.insertBefore(logItem, logList.firstChild);
    if (logList.children.length > 20) logList.removeChild(logList.lastChild);
}

// 导出
window.Game = {
    state: gameState,
    defaultState,
    simulateTime,
    simulateMonth,
    addLog,
    getDaysInMonth,
    // 外部链接系统
    buyExternalLink,
    getLinkName,
    setLinkPrice,
    getExternalLinksOverview,
    calculateTotalMaintenanceCost,
    calculateTotalLinkCapacity,
    // 电力系统
    buyExternalPower,
    updatePowerGeneration,
    updateEnergyConsumption,
    // 服务设施系统
    buyFacility,
    upgradeFacility,
    monitorEnergyStatus,
    calculateFacilityMaintenanceCost,
    calculateFacilityRevenue,
    getFacilitiesOverview
};