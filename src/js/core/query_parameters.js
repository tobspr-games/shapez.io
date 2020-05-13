const queryString = require("query-string");
const options = queryString.parse(location.search);

export let queryParamOptions = {
    embedProvider: null,
    betaMode: null,
};

if (options.embed) {
    queryParamOptions.embedProvider = options.embed;
}

if (!G_IS_RELEASE && options.betamode) {
    queryParamOptions.betaMode = true;
}
