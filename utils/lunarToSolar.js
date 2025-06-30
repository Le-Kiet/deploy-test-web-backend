// src/utils/lunarToSolar.js

function INT(d) {
    return Math.floor(d);
}

function jdFromDate(dd, mm, yy) {
    const a = INT((14 - mm) / 12);
    const y = yy + 4800 - a;
    const m = mm + 12 * a - 3;
    const jd =
        dd +
        INT((153 * m + 2) / 5) +
        365 * y +
        INT(y / 4) -
        INT(y / 100) +
        INT(y / 400) -
        32045;
    return jd;
}

function jdToDate(jd) {
    let a, b, c, d, e, m;
    a = jd + 32044;
    b = INT((4 * a + 3) / 146097);
    c = a - INT((146097 * b) / 4);
    d = INT((4 * c + 3) / 1461);
    e = c - INT((1461 * d) / 4);
    m = INT((5 * e + 2) / 153);
    const day = e - INT((153 * m + 2) / 5) + 1;
    const month = m + 3 - 12 * INT(m / 10);
    const year = 100 * b + d - 4800 + INT(m / 10);
    return new Date(year, month - 1, day);
}

function getNewMoonDay(k) {
    const T = k / 1236.85;
    const T2 = T * T;
    const T3 = T2 * T;
    const dr = Math.PI / 180;
    let Jd1 =
        2415020.75933 +
        29.53058868 * k +
        0.0001178 * T2 -
        0.000000155 * T3 +
        0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    let C1 =
        (0.1734 - 0.000393 * T) * Math.sin(M * dr) +
        0.0021 * Math.sin(2 * dr * M) -
        0.4068 * Math.sin(Mpr * dr) +
        0.0161 * Math.sin(dr * 2 * Mpr) -
        0.0004 * Math.sin(dr * 3 * Mpr) +
        0.0104 * Math.sin(dr * 2 * F) -
        0.0051 * Math.sin(dr * (M + Mpr)) -
        0.0074 * Math.sin(dr * (M - Mpr)) +
        0.0004 * Math.sin(dr * (2 * F + M)) -
        0.0004 * Math.sin(dr * (2 * F - M)) -
        0.0006 * Math.sin(dr * (2 * F + Mpr)) +
        0.001 * Math.sin(dr * (2 * F - Mpr)) +
        0.0005 * Math.sin(dr * (2 * Mpr + M));
    let deltaT =
        T < -11
            ? 0.001 +
              0.000839 * T +
              0.0002261 * T2 -
              0.00000845 * T3 -
              0.000000081 * T * T3
            : -0.000278 + 0.000265 * T + 0.000262 * T2;
    return INT(Jd1 + C1 - deltaT + 0.5);
}

function getLunarMonth11(yy) {
    const off = jdFromDate(31, 12, yy) - 2415021;
    const k = INT(off / 29.530588853);
    let nm = getNewMoonDay(k);
    const sunLong = getSunLongitude(nm);
    if (sunLong >= 9) nm = getNewMoonDay(k - 1);
    return nm;
}

function getSunLongitude(jdn) {
    const T = (jdn - 2451545.0) / 36525;
    const T2 = T * T;
    const dr = Math.PI / 180;
    const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    const DL =
        (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M) +
        (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) +
        0.00029 * Math.sin(dr * 3 * M);
    const L = L0 + DL;
    const omega = 125.04 - 1934.136 * T;
    const lambda = L - 0.00569 - 0.00478 * Math.sin(omega * dr);
    return INT(lambda / 30);
}

function convertLunar2Solar(
    lunarDay,
    lunarMonth,
    lunarYear,
    lunarLeap = false
) {
    let k, off, leapOff, leapMonth, a11, b11, monthStart;
    if (lunarMonth < 11) {
        a11 = getLunarMonth11(lunarYear - 1);
        b11 = getLunarMonth11(lunarYear);
    } else {
        a11 = getLunarMonth11(lunarYear);
        b11 = getLunarMonth11(lunarYear + 1);
    }
    k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    off = lunarMonth - 11;
    if (off < 0) off += 12;
    if (b11 - a11 > 365) {
        leapOff = getLeapMonthOffset(a11);
        leapMonth = leapOff - 2;
        if (leapMonth < 0) leapMonth += 12;
        if (lunarLeap && lunarMonth !== leapMonth) return null;
        if (lunarLeap || off >= leapOff) off += 1;
    }
    monthStart = getNewMoonDay(k + off);
    return jdToDate(monthStart + lunarDay - 1);
}

function getLeapMonthOffset(a11) {
    let k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    let last,
        arc = getSunLongitude(getNewMoonDay(k + 1));
    let i = 1;
    do {
        last = arc;
        i++;
        arc = getSunLongitude(getNewMoonDay(k + i));
    } while (arc !== last && i < 14);
    return i - 1;
}
function convertSolar2Lunar(dd, mm, yy, timeZone = 7) {
    const dayNumber = jdFromDate(dd, mm, yy);
    const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
    let monthStart = getNewMoonDay(k + 1);
    if (monthStart > dayNumber) {
        monthStart = getNewMoonDay(k);
    }
    const a11 = getLunarMonth11(yy);
    const b11 = getLunarMonth11(yy + 1);
    let lunarYear = yy;
    if (a11 >= monthStart) {
        lunarYear = yy - 1;
    }

    const lunarDay = dayNumber - monthStart + 1;
    const diff = INT((monthStart - a11) / 29);
    let lunarLeap = false;
    let lunarMonth = diff + 11;

    if (b11 - a11 > 365) {
        const leapMonthDiff = getLeapMonthOffset(a11);
        if (diff >= leapMonthDiff) {
            lunarMonth = diff + 10;
            if (diff === leapMonthDiff) {
                lunarLeap = true;
            }
        }
    }

    if (lunarMonth > 12) lunarMonth -= 12;
    if (lunarMonth >= 11 && diff < 4) lunarYear++;

    return {
        day: lunarDay,
        month: lunarMonth,
        year: lunarYear,
        leap: lunarLeap,
    };
}
module.exports = {
  convertLunar2Solar,
  convertSolar2Lunar,
};
