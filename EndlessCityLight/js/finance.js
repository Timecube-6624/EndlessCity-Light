// finance.js - 财政系统模块

/**
 * 财政模块 - 统一管理财政收入、支出、预算计算
 */

// 财政收入明细计算
function calculateIncome(state) {
    const pv = state.policyValues;
    
    // 基础收入
    const baseIncome = state.baseIncome;
    
    // 计算总住宅区面积（各密度住宅区相加）
    const res = state.zones.residential;
    const totalResidential = res.lowDensity + res.mediumDensity + res.highDensity + res.skyscraper;
    
    // 获取工业细分数据
    const industry = state.industry;
    
    // 税收收入（按细分产业计算）
    const manufacturingTax = Math.round(industry.manufacturing * pv.taxManufacturing * 12);
    const heavyIndustryTax = Math.round(industry.heavyIndustry * pv.taxHeavyIndustry * 15);
    const hiTechTax = Math.round(industry.hiTech * pv.taxHiTech * 8);
    const commerceTax = Math.round(state.commerce * pv.taxCommerce * 8);
    const residentialTax = Math.round(totalResidential * pv.taxResidential * 50);
    const officeTax = Math.round(state.zones.commercial * pv.taxOffice * 30);
    const taxIncome = manufacturingTax + heavyIndustryTax + hiTechTax + commerceTax + residentialTax + officeTax;
    
    // 贸易收入
    const tradeIncome = Math.round((pv.tradeOpen * 0.01) * state.gdp);
    
    // 旅游收入
    const tourismIncome = Math.round(state.tourists * pv.greenCity * 0.5);
    
    // 设施收入（商业设施产生的收益）
    let facilityIncome = 0;
    if (state.facilities && state.facilities.commercial) {
        Object.keys(state.facilities.commercial).forEach(key => {
            const facility = state.facilities.commercial[key];
            if (facility.owned > 0) {
                facilityIncome += Math.round(facility.revenue * facility.efficiency * 30);
            }
        });
    }
    
    // 总收入
    const totalIncome = baseIncome + taxIncome + tradeIncome + tourismIncome + facilityIncome;
    
    return {
        baseIncome,
        manufacturingTax,
        heavyIndustryTax,
        hiTechTax,
        commerceTax,
        residentialTax,
        officeTax,
        taxIncome,
        tradeIncome,
        tourismIncome,
        facilityIncome,
        totalIncome
    };
}

// 财政支出明细计算
function calculateExpense(state) {
    const pv = state.policyValues;
    const budget = state.budget;
    
    // 基础支出
    const baseExpense = state.baseExpense;
    
    // 社会福利支出
    const welfareExpense = Math.round(pv.welfare * 50 + pv.pension * 30);
    
    // 基础设施支出（与预算挂钩）
    const infraExpense = budget.total;
    
    // 医疗支出
    const healthcareExpense = Math.round(pv.healthcare * 40);
    
    // 教育支出
    const educationExpense = Math.round(pv.educationInvest * 30);
    
    // 能源购买支出
    const energyPurchaseExpense = Math.round(state.powerGeneration.purchase * state.powerGeneration.purchasePrice);
    
    // 设施维护支出
    let facilityMaintenanceExpense = 0;
    if (state.facilities) {
        // 发电设施维护
        if (state.facilities.power) {
            Object.keys(state.facilities.power).forEach(key => {
                const facility = state.facilities.power[key];
                if (facility.owned > 0) {
                    facilityMaintenanceExpense += facility.baseMaintenance * 30;
                }
            });
        }
        // 服务设施维护
        if (state.facilities.services) {
            Object.keys(state.facilities.services).forEach(key => {
                const facility = state.facilities.services[key];
                if (facility.owned > 0) {
                    facilityMaintenanceExpense += facility.baseMaintenance * 30;
                }
            });
        }
        // 商业设施维护
        if (state.facilities.commercial) {
            Object.keys(state.facilities.commercial).forEach(key => {
                const facility = state.facilities.commercial[key];
                if (facility.owned > 0) {
                    facilityMaintenanceExpense += facility.baseMaintenance * 30;
                }
            });
        }
    }
    
    // 总支出
    const totalExpense = baseExpense + welfareExpense + infraExpense + healthcareExpense + educationExpense + energyPurchaseExpense + facilityMaintenanceExpense;
    
    return {
        baseExpense,
        welfareExpense,
        infraExpense,
        healthcareExpense,
        educationExpense,
        energyPurchaseExpense,
        facilityMaintenanceExpense,
        totalExpense
    };
}

// 计算月度财政结余
function calculateMonthlyBalance(state) {
    const income = calculateIncome(state);
    const expense = calculateExpense(state);
    const balance = income.totalIncome - expense.totalExpense;
    
    return {
        income,
        expense,
        balance,
        balancePerDay: Math.round(balance / 30),
        balancePerHour: Math.round(balance / 720)
    };
}

// 计算实时收支率（每分钟）
function calculateRealtimeRates(state) {
    const monthly = calculateMonthlyBalance(state);
    const minutesPerMonth = 43200; // 30天 * 24小时 * 60分钟
    
    return {
        incomePerMinute: monthly.income.totalIncome / minutesPerMonth,
        expensePerMinute: monthly.expense.totalExpense / minutesPerMonth,
        balancePerMinute: monthly.balance / minutesPerMonth
    };
}

// 验证财政计算（用于调试）
function validateFinanceCalculation(state) {
    const result = {
        state: {
            money: state.money,
            baseIncome: state.baseIncome,
            baseExpense: state.baseExpense,
            budgetTotal: state.budget.total
        },
        income: calculateIncome(state),
        expense: calculateExpense(state),
        balance: calculateMonthlyBalance(state),
        rates: calculateRealtimeRates(state),
        timestamp: new Date().toISOString()
    };
    
    // 验证公式
    result.validation = {
        incomeSumCheck: result.income.totalIncome === 
            result.income.baseIncome + result.income.taxIncome + 
            result.income.tradeIncome + result.income.tourismIncome + result.income.facilityIncome,
        expenseSumCheck: result.expense.totalExpense === 
            result.expense.baseExpense + result.expense.welfareExpense + 
            result.expense.infraExpense + result.expense.healthcareExpense + 
            result.expense.educationExpense + result.expense.energyPurchaseExpense + result.expense.facilityMaintenanceExpense,
        balanceCheck: result.balance.balance === 
            result.income.totalIncome - result.expense.totalExpense,
        budgetExpenseLink: result.expense.infraExpense === result.state.budgetTotal
    };
    
    return result;
}

// 模拟财政测试（验证算法正确性）
function runFinanceSimulation(initialState, months = 3) {
    const results = [];
    let testState = JSON.parse(JSON.stringify(initialState));
    
    for (let month = 1; month <= months; month++) {
        const validation = validateFinanceCalculation(testState);
        results.push({
            month,
            money: testState.money,
            balance: validation.balance.balance,
            income: validation.income.totalIncome,
            expense: validation.expense.totalExpense,
            isValid: validation.validation.incomeSumCheck && 
                     validation.validation.expenseSumCheck && 
                     validation.validation.balanceCheck
        });
        
        // 模拟一个月后资金变化
        const monthlyBalance = validation.balance.balance;
        testState.money += monthlyBalance;
    }
    
    return {
        initialMoney: initialState.money,
        finalMoney: testState.money,
        expectedChange: results.reduce((sum, r) => sum + r.balance, 0),
        actualChange: testState.money - initialState.money,
        monthlyResults: results
    };
}

// 导出模块
window.Finance = {
    calculateIncome,
    calculateExpense,
    calculateMonthlyBalance,
    calculateRealtimeRates,
    validateFinanceCalculation,
    runFinanceSimulation
};
