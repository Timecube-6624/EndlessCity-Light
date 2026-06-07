// astronomy.js - 天文计算模块

/**
 * 计算日出日落时间
 * @param {number} lat - 纬度
 * @param {number} lng - 经度
 * @param {number} month - 月份
 * @param {number} day - 日期
 * @returns {object} - { sunrise, sunset, daylight }
 */
function calculateSunTimes(lat, lng, month, day) {
    const timezone = Math.round(lng / 15);
    const n1 = Math.floor(275 * month / 9);
    const n2 = Math.floor((month + 9) / 12);
    const n3 = (1 + Math.floor((2024 - 4 * Math.floor(2024 / 4) + 2) / 3));
    const n = n1 - (n2 * n3) + day - 30;
    
    // 太阳赤纬
    const solarDeclination = 23.45 * Math.sin(Math.PI / 365 * (n - 81));
    const latRad = lat * Math.PI / 180;
    const declRad = solarDeclination * Math.PI / 180;
    const cosHourAngle = -Math.tan(latRad) * Math.tan(declRad);
    
    // 极昼极夜处理
    if (cosHourAngle < -1) return { sunrise: '00:00', sunset: '23:59', daylight: '24小时', isPolarDay: true };
    if (cosHourAngle > 1) return { sunrise: '--:--', sunset: '--:--', daylight: '0小时', isPolarNight: true };
    
    const hourAngle = Math.acos(cosHourAngle) * 180 / Math.PI;
    const sunriseHour = 12 - hourAngle / 15 - lng / 15 + timezone;
    const sunsetHour = 12 + hourAngle / 15 - lng / 15 + timezone;
    
    const formatTime = (h) => {
        const hours = Math.floor(h);
        const mins = Math.floor((h - hours) * 60);
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };
    
    const daylight = sunsetHour - sunriseHour;
    
    return {
        sunrise: formatTime(sunriseHour),
        sunset: formatTime(sunsetHour),
        daylight: `${Math.floor(daylight)}小时${Math.floor((daylight - Math.floor(daylight)) * 60)}分`,
        sunriseHour: sunriseHour,
        sunsetHour: sunsetHour
    };
}

/**
 * 判断当前是否为白天
 * @param {number} currentHour - 当前小时
 * @param {object} sunTimes - 日出日落时间对象
 * @returns {boolean}
 */
function isDaytime(currentHour, sunTimes) {
    if (sunTimes.isPolarDay) return true;
    if (sunTimes.isPolarNight) return false;
    return currentHour >= sunTimes.sunriseHour && currentHour < sunTimes.sunsetHour;
}

/**
 * 获取季节名称
 * @param {number} month - 月份
 * @param {number} lat - 纬度
 * @returns {string}
 */
function getSeason(month, lat) {
    const isNorth = lat >= 0;
    const seasons = isNorth 
        ? ['冬', '冬', '春', '春', '春', '夏', '夏', '夏', '秋', '秋', '秋', '冬']
        : ['夏', '夏', '秋', '秋', '秋', '冬', '冬', '冬', '春', '春', '春', '夏'];
    return seasons[month - 1];
}

/**
 * 获取时区
 * @param {number} lng - 经度
 * @returns {string}
 */
function getTimezone(lng) {
    const offset = Math.round(lng / 15);
    return `UTC${offset >= 0 ? '+' : ''}${offset}`;
}

// 导出函数（供其他模块使用）
window.Astronomy = {
    calculateSunTimes,
    isDaytime,
    getSeason,
    getTimezone
};