const https = require("https");

let accessToken = process.env.DRIVE_TOKEN;

console.log("drive all env: ");
console.log(JSON.parse(process.env, 2));
console.log(accessToken);

function getFile(filename, callback){
	let hostname = "content.dropboxapi.com";
	let path = "/2/files/download";
	
	let opts = {
		hostname: hostname,
		path: path,
		method: 'POST',
		headers: {
			"Authorization": "Bearer " + accessToken,
			"Dropbox-API-Arg": JSON.stringify({
				"path": "/" + filename
			})
		}
	};
	
	console.log("DRIVE AUTH: " + opts.headers["Authorization"]);
	
	let req = https.request(opts, function(res){
		res.setEncoding('utf8');
		let dt = "";
		res.on('data', (chunk) => {
			dt += chunk;
		});
		res.on('end', () => {
			callback(dt);
		});
	});
	req.end();
}

function updateFile(filename, contents, callback){
	let hostname = "content.dropboxapi.com";
	let path = "/2/files/upload";
	
	let req = https.request({
		hostname: hostname,
		path: path,
		method: 'POST',
		headers: {
			"Authorization": "Bearer " + accessToken,
			"Content-Type": "text/plain; charset=dropbox-cors-hack",
			"Dropbox-API-Arg": JSON.stringify({
				"path": "/" + filename,
				"mode": "overwrite",
				"mute": true,
				"strict_conflict": false
			})
		}
		
	}, callback);
	req.write(contents);
	req.end();
}

function saveDatabase(databaseName, database){
	updateFile(databaseName + ".json", JSON.stringify(database))
}

function getDatabase(databaseName, callback){
	getFile(databaseName + ".json", (content) => callback(JSON.parse(content)));
}



module.exports = {
	saveDatabase: saveDatabase,
	loadDatabase: getDatabase,
	getFile: getFile,
	updateFile: updateFile
}




