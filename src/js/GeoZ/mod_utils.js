/**
 * Returns a file as a data URI
 * @param {string} url 
 * @returns {Promise<String>}
 */
export function getFileAsDataURI(url) {
	return fetch(url)
	.then(response => response.blob())
	.then(blob => {
		return new Promise((resolve) => {
			var reader = new FileReader() ;
			reader.onload = function() { resolve(this.result.toString()) } ; // <--- `this.result` contains a base64 data URI
			reader.readAsDataURL(blob) ;
		});
	});
}