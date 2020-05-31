const queryString = require("query-string");
const options = queryString.parse(location.search);

export let queryParamOptions = {
    embedProvider: null,
    modDeveloper: true,
};

if (options.embed) {
    queryParamOptions.embedProvider = options.embed;
}
