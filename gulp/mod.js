const oneExport = exp => {
    return `${exp}=v`; // No checks needed
};

const twoExports = (exp1, exp2) => {
    return `n=="${exp1}"?${exp1}=v:${exp2}=v`;
};

const multiExports = exps => {
    exps = exps.map(exp => `case "${exp}":${exp}=v;break;`);

    return `switch(n){${exps.toString().replaceAll(";,", ";")} }`;
};

const defineFnBody = source => {
    const regex = /export (?:let|class) (?<name>\w+)/g;
    let names = [...source.matchAll(regex)].map(n => n.groups.name);
    switch (names.length) {
        case 0:
            return false;
        case 1:
            return oneExport(names[0]);
        case 2:
            return twoExports(names[0], names[1]);
        default:
            return multiExports(names);
    }
};
/**
 *
 * @param {string} source
 * @param {*} map
 * @returns
 */
module.exports = function (source, map) {
    const body = defineFnBody(source);
    if (!body) return source;
    return source + `\nexport const __$S__=(n,v)=>{${body}}`;
};
