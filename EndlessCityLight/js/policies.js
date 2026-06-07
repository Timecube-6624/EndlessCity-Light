// policies.js - 政策调节数据模块

// 政策滑块配置
const policySliders = {
    tax: [
        {
            id: 'taxManufacturing',
            name: '制造业税率',
            desc: '调整制造业企业税率，影响制造业发展和就业',
            min: 0,
            max: 50,
            default: 15,
            unit: '%',
            effects: { manufacturing: -0.1, money: 1 }
        },
        {
            id: 'taxHeavyIndustry',
            name: '重工业税率',
            desc: '调整重工业企业税率，高税率可抑制污染企业',
            min: 0,
            max: 50,
            default: 18,
            unit: '%',
            effects: { heavyIndustry: -0.1, environment: 0.05, money: 1 }
        },
        {
            id: 'taxHiTech',
            name: '高新产业税率',
            desc: '调整高新技术产业税率，低税率可吸引科技企业',
            min: 0,
            max: 50,
            default: 8,
            unit: '%',
            effects: { hiTech: 0.1, growth: 0.05, money: 0.5 }
        },
        {
            id: 'taxCommerce',
            name: '商业税率',
            desc: '调整商业企业税率，影响商业活力和旅游',
            min: 0,
            max: 50,
            default: 18,
            unit: '%',
            effects: { commerce: -0.1, tourism: -0.05, money: 1 }
        },
        {
            id: 'taxResidential',
            name: '居住税率',
            desc: '调整居民房产税，直接影响幸福度',
            min: 0,
            max: 50,
            default: 10,
            unit: '%',
            effects: { happiness: -0.15, money: 1 }
        },
        {
            id: 'taxOffice',
            name: '办公税率',
            desc: '调整写字楼和办公场所税率，影响服务业',
            min: 0,
            max: 50,
            default: 12,
            unit: '%',
            effects: { service: -0.1, money: 1 }
        }
    ],
    economy: [
        {
            id: 'techInvest',
            name: '科技投资',
            desc: '投资科技研发，提升产业竞争力',
            min: 0,
            max: 100,
            default: 10,
            unit: '',
            effects: { growth: 0.2, education: 0.1, industry: 0.5 }
        },
        {
            id: 'tradeOpen',
            name: '贸易开放度',
            desc: '开放程度影响商业活力和外来投资',
            min: 0,
            max: 100,
            default: 30,
            unit: '%',
            effects: { commerce: 0.3, growth: 0.1, money: 0.5 }
        },
        {
            id: 'minWage',
            name: '最低工资',
            desc: '提高劳动者收入，增加消费但可能影响企业成本',
            min: 0,
            max: 100,
            default: 50,
            unit: '',
            effects: { happiness: 0.1, commerce: 0.1, manufacturing: -0.1 }
        },
        {
            id: 'industrialUpgrade',
            name: '产业升级',
            desc: '推动传统产业向高新技术产业转型',
            min: 0,
            max: 100,
            default: 20,
            unit: '',
            effects: { hiTech: 0.3, manufacturing: -0.1, growth: 0.15 }
        },
        {
            id: 'energySaving',
            name: '节能减排',
            desc: '强制企业采用节能减排技术',
            min: 0,
            max: 100,
            default: 15,
            unit: '',
            effects: { environment: 0.15, heavyIndustry: -0.15, techInvest: 0.1 }
        },
        {
            id: 'industrialZone',
            name: '工业园区建设',
            desc: '建设工业园区，吸引制造业企业入驻',
            min: 0,
            max: 100,
            default: 25,
            unit: '',
            effects: { manufacturing: 0.2, employment: 0.1, money: -0.2 }
        }
    ],
    social: [
        {
            id: 'healthcare',
            name: '医疗投入',
            desc: '建立公共医疗体系，提升健康水平',
            min: 0,
            max: 100,
            default: 40,
            unit: '',
            effects: { health: 0.15, happiness: 0.1, money: -0.4 }
        },
        {
            id: 'educationInvest',
            name: '教育投入',
            desc: '改革教育体系，提升人才质量',
            min: 0,
            max: 100,
            default: 50,
            unit: '',
            effects: { education: 0.12, growth: 0.05, happiness: 0.05 }
        },
        {
            id: 'welfare',
            name: '社会福利',
            desc: '完善社会保障体系',
            min: 0,
            max: 100,
            default: 30,
            unit: '',
            effects: { happiness: 0.15, safety: 0.05, money: -0.3 }
        },
        {
            id: 'pension',
            name: '养老金',
            desc: '提高退休人员待遇',
            min: 0,
            max: 100,
            default: 40,
            unit: '',
            effects: { happiness: 0.08, health: 0.05, money: -0.2 }
        }
    ],
    infra: [
        {
            id: 'roadBuild',
            name: '道路建设',
            desc: '改善交通基础设施',
            min: 0,
            max: 100,
            default: 20,
            unit: '',
            effects: { commerce: 0.1, industry: 0.1, environment: -0.05, money: -0.2 }
        },
        {
            id: 'greenCity',
            name: '绿化建设',
            desc: '建设公园和绿地',
            min: 0,
            max: 100,
            default: 30,
            unit: '',
            effects: { environment: 0.2, happiness: 0.1, health: 0.08, tourism: 0.2 }
        },
        {
            id: 'housing',
            name: '住房建设',
            desc: '建设公共住房项目',
            min: 0,
            max: 100,
            default: 25,
            unit: '',
            effects: { happiness: 0.1, population: 0.01, safety: 0.05, money: -0.3 }
        },
        {
            id: 'police',
            name: '治安投入',
            desc: '增加警力和监控设施',
            min: 0,
            max: 100,
            default: 35,
            unit: '',
            effects: { safety: 0.15, happiness: 0.03, money: -0.15 }
        }
    ]
};

/**
 * 渲染滑块控件
 */
function renderSliders(category) {
    const container = document.getElementById('sliderControls');
    if (!container) return;
    
    container.innerHTML = '';
    const sliders = policySliders[category];
    
    sliders.forEach(slider => {
        const currentValue = Game.state.policyValues[slider.id] || slider.default;
        const group = document.createElement('div');
        group.className = 'slider-group';
        
        group.innerHTML = `
            <div class="slider-header">
                <span class="slider-name">${slider.name}</span>
                <span class="slider-value">${currentValue}${slider.unit}</span>
            </div>
            <div class="slider-desc">${slider.desc}</div>
            <div class="slider-track">
                <div class="slider-fill" style="width: ${(currentValue - slider.min) / (slider.max - slider.min) * 100}%"></div>
            </div>
            <input type="range" class="slider-input" 
                id="slider_${slider.id}"
                min="${slider.min}" 
                max="${slider.max}" 
                value="${currentValue}"
                oninput="updateSlider('${slider.id}', this.value, '${slider.unit}', ${slider.min}, ${slider.max})">
        `;
        
        container.appendChild(group);
    });
    
    // 切换标签时也更新功能区显示
    UI.updateZoneDisplay();
}

/**
 * 更新滑块值
 */
function updateSlider(id, value, unit, min, max) {
    Game.state.policyValues[id] = parseInt(value);
    
    // 更新显示
    const sliderGroup = document.getElementById(`slider_${id}`).parentElement;
    sliderGroup.querySelector('.slider-value').textContent = `${value}${unit}`;
    sliderGroup.querySelector('.slider-fill').style.width = `${(value - min) / (max - min) * 100}%`;
    
    // 立即更新城市功能区显示（政策调节实时影响）
    UI.updateZoneDisplay();
}

// 导出
window.Policies = {
    sliders: policySliders,
    renderSliders,
    updateSlider
};