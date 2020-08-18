const https = require("https");

let accessToken = "jIU24EnHl28AAAAAAAAAAbMgEIHDytA-cjIOXKbrMVI0KA4yd-lJZhZjDVqN82kx";


function saveDatabase(databaseName, database){
	
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
				"path": "/" + databaseName + ".json",
				"mode": "overwrite",
				"mute": true,
				"strict_conflict": false
			})
		}
		
	}, function(res){});
	req.write(JSON.stringify(database));
	req.end();
}

function getDatabase(databaseName, callback){
	
	let hostname = "content.dropboxapi.com";
	let path = "/2/files/download";
	
	let req = https.request({
		hostname: hostname,
		path: path,
		method: 'POST',
		headers: {
			"Authorization": "Bearer " + accessToken,
			"Dropbox-API-Arg": JSON.stringify({
				"path": "/" + databaseName + ".json"
			})
		}
		
	}, function(res){
		res.setEncoding('utf8');
		let dt = "";
		res.on('data', (chunk) => {
			dt += chunk;
		});
		res.on('end', () => {
			callback(JSON.parse(dt));
		});
	});
	req.end();
	
}

module.exports = {
	saveDatabase: saveDatabase,
	loadDatabase: getDatabase
}




