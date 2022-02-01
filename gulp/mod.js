module.exports = function (source, map) {
    return source + `\nexport let $s=(n,v)=>eval(n+"=v")`;
};
