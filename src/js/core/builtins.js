// Store the original version of all builtins to prevent modification

export const JSON_stringify = JSON.stringify.bind(JSON);
export const JSON_parse = JSON.parse.bind(JSON);

export function Math_radians(degrees) {
    return (degrees * Math_PI) / 180.0;
}

export function Math_degrees(radians) {
    return (radians * 180.0) / Math_PI;
}

export const performanceNow = performance.now.bind(performance);

export const Math_abs = Math.abs.bind(Math);
export const Math_ceil = Math.ceil.bind(Math);
export const Math_floor = Math.floor.bind(Math);
export const Math_round = Math.round.bind(Math);
export const Math_sign = Math.sign.bind(Math);
export const Math_sqrt = Math.sqrt.bind(Math);
export const Math_min = Math.min.bind(Math);
export const Math_max = Math.max.bind(Math);
export const Math_sin = Math.sin.bind(Math);
export const Math_cos = Math.cos.bind(Math);
export const Math_tan = Math.tan.bind(Math);
export const Math_hypot = Math.hypot.bind(Math);
export const Math_atan2 = Math.atan2.bind(Math);
export const Math_pow = Math.pow.bind(Math);
export const Math_random = Math.random.bind(Math);
export const Math_exp = Math.exp.bind(Math);
export const Math_log10 = Math.log10.bind(Math);

export const Math_PI = 3.1415926;
