/**
 *
 * @param {string} source
 * @param {*} map
 * @returns
 */
module.exports = function (source, map) {
    const regex = /export (?:let|class) (?<name>\w+)/g;
    // @ts-ignore
    [...source.matchAll(regex)]
        .map(n => n.groups.name)
        .forEach(name => (source += `export const $S_${name}=(v)=>${name}=v;\n`));

    return source;
};
