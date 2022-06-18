export let APPLICATION_ERROR_OCCURED = false;

/**
 *
 * @param {Event|string} message
 * @param {string} source
 * @param {number} lineno
 * @param {number} colno
 * @param {Error} source
 */
function catchErrors(message, source, lineno, colno, error) {
    APPLICATION_ERROR_OCCURED = true;
    console.error(message, source, lineno, colno, error);
}

window.addEventListener("error", catchErrors);
