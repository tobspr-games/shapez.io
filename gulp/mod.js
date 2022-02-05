module.exports = function (source, map) {
    return source + `\nexport const __$S__=(n,v)=>eval("(function(v){" + n + "=v})")(v)`;
};
