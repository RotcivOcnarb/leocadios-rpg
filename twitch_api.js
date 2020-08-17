const https = require("https");

//PEGA O ACCESS TOKEN;

let access_token = "";

request_access_token(function(access_token){
	getLiveViewCount(() => {});
	//getBotID();
	
});

function getLiveViewCount(callback){
	
	if(access_token == ""){
		request_access_token((access_token) => {
			_getLive(access_token, (live) => {
				if(live) callback(live.viewer_count);
				else callback(0);
			});
		});
	}
	else{
		_getLive(access_token, (live) => {
			if(live) callback(live.viewer_count);
			else callback(0);
		});
	}
}

function request_access_token(callback){
	let req = https.request({
		host: "id.twitch.tv",
		path: "/oauth2/token?client_id=mfko21ti9vhpzbpkgbb7lse4yxl7cu&client_secret=bjbu4xo5ib508mebsth83mx6jij0bw&grant_type=client_credentials",
		method: "POST",
	}, function(response){
		let body = "";
		response.on('data', (d) => {
			body += d;
		});
		response.on('end', () => {
			let json = JSON.parse(body);
			access_token = json["access_token"];
			callback(json["access_token"]);
		});
	});

	req.end();

	req.on('error', function(e) {
	  console.error(e);
	});
}

function getBotID(){
	
	let req = https.request({
		host: "api.twitch.tv",
		path: "/helix/users?login=RotsBots",
		method: "GET",
		headers: {"Client-ID": "mfko21ti9vhpzbpkgbb7lse4yxl7cu", "Authorization": "Bearer " + access_token}
	}, function(response){
		let body = "";
		response.on('data', (d) => {
			body += d;
		});
		response.on('end', () => {
			let json = JSON.parse(body);
			console.log(JSON.stringify(json, null, 2));
		});
	});

	req.end();

	req.on('error', function(e) {
	  console.error(e);
	});
}

//

function _getLive(access_token, callback){
	
	
	let req = https.request({
		host: "api.twitch.tv",
		path: "/helix/streams?user_id=106700788",
		method: "GET",
		headers: {"Client-ID": "mfko21ti9vhpzbpkgbb7lse4yxl7cu", "Authorization": "Bearer " + access_token}
	}, function(response){
		let body = "";
		response.on('data', (d) => {
			body += d;
		});
		response.on('end', () => {
			let json = JSON.parse(body);
			callback(json.data[0]);
		});
	});

	req.end();

	req.on('error', function(e) {
	  console.error(e);
	});
}

/*
USER ID DO ROTCIV: 57747252
USER ID DO LEOCADIO: 106700788
*/

module.exports = {
	"getLiveViewCount": getLiveViewCount
};