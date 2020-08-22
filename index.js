const express = require("express");
const app = express();
const path = require("path");
const database = require("./database");
const items = require("./items");
const https = require("https");
const shop = require("./data/shop.json");
const dropbox = require("./drive_api");

let environment = (process.env.NODE_ENV || "development");

process.app_version = "v0.2";

const bot = require("./bot");

if(environment == "production"){

	dropbox.getFile("streamers.json", (contents) => {
		let st = JSON.parse(contents);
		
		if(st.error){
			dropbox.updateFile("streamers.json", "[]");
			return;
		}
		
		for(s in st){
			console.log("Inicializando para o streamer: " + st[s]);
			bot(environment, st[s]);
		}
	});

}
else{
	dropbox.getFile("streamers.json", (contents) => {
		let st = JSON.parse(contents);
		
		if(st.error){
			dropbox.updateFile("streamers.json", "[]");
			return;
		}

		bot(environment, "rotcivocnarb");
	});
}


app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/personagem", (req, res) => {
	
	if(req.query["id"] && req.query["env"] && req.query["streamer"]){
		let twitch_id = req.query["id"];
		let allCharacters = database.getAllCharacters(req.query["env"], req.query["streamer"]);
		
		if(allCharacters[twitch_id]){
			res.render("index", {
				"allCharacters": allCharacters,
				"character": allCharacters[twitch_id],
				"items": items
				
			});
		}
		else res.render("not_found");
	}
	else res.render("not_found");	
	
});

const seedrandom = require("seedrandom");
app.locals.seedrandom = seedrandom;

app.get("/shop", (req, res) => {
	res.render("shop", {
		"shop": shop, 
		"items": items
		
	});
});

app.get("/ping", (req, res) => {
	
	console.log("PING received, sending pong...");
	
	https.request({
		hostname: "rpg-ping-pong.herokuapp.com",
		path: "/pong",
		method: "GET"
	}, r => console.log("pong sent code: " + r.statusCode)).end();	
	
	res.send();
});

app.get("/addbot", (req, res) => {
	
	res.render("authorize");

});

app.get("/removebot", (req, res) => {
	
	res.render("removebot");

});

app.get("/authorize", (req, res) => {
	
	https.request({
		hostname: "id.twitch.tv",
		path: "/oauth2/token?client_id=mfko21ti9vhpzbpkgbb7lse4yxl7cu&client_secret=bjbu4xo5ib508mebsth83mx6jij0bw&code="+req.query["code"]+"&grant_type=authorization_code&redirect_uri=http://localhost/",
		method: "POST"
	}, (r) => {
		console.log(r.statusCode);		
		let body = "";
		
		r.setEncoding('utf8');
		r.on('data', function (chunk) {
			body += chunk;
		});
		
		r.on('end', () => {
			let o = JSON.parse(body);
			o.access_token
			
			https.request({
				hostname: "api.twitch.tv",
				path: "/helix/users",
				method: "GET",
				headers: {
					"Client-Id": "mfko21ti9vhpzbpkgbb7lse4yxl7cu",
					"Authorization": "Bearer " + o.access_token
				}
			}, (r2) => {
				let b = "";
				r2.on('data', (c) => {b += c;});
				r2.on('end', () => {
					//Faz a requisição pro dropbox e atualiza a lista de nomes
					dropbox.getFile("streamers.json", (contents) => {
						
						let a = JSON.parse(contents);
						let userinfo = JSON.parse(b)["data"][0];
						if(!a.includes(userinfo["login"])){
							
							a.push(userinfo["login"]);
							dropbox.updateFile("streamers.json", JSON.stringify(a));
							console.log("Added user " + userinfo["login"] + " to our list");
							bot(environment, userinfo["login"]);
						}
					});
					;
				})
			}).end();
		})

		res.render("addchannel");
	}).end();
	
	
});

app.get("/removesuccess", (req, res) => {
	
	https.request({
		hostname: "id.twitch.tv",
		path: "/oauth2/token?client_id=mfko21ti9vhpzbpkgbb7lse4yxl7cu&client_secret=bjbu4xo5ib508mebsth83mx6jij0bw&code="+req.query["code"]+"&grant_type=authorization_code&redirect_uri=http://localhost/",
		method: "POST"
	}, (r) => {
		console.log(r.statusCode);		
		let body = "";
		
		r.setEncoding('utf8');
		r.on('data', function (chunk) {
			body += chunk;
		});
		
		r.on('end', () => {
			let o = JSON.parse(body);
			o.access_token
			
			https.request({
				hostname: "api.twitch.tv",
				path: "/helix/users",
				method: "GET",
				headers: {
					"Client-Id": "mfko21ti9vhpzbpkgbb7lse4yxl7cu",
					"Authorization": "Bearer " + o.access_token
				}
			}, (r2) => {
				let b = "";
				r2.on('data', (c) => {b += c;});
				r2.on('end', () => {
					//Faz a requisição pro dropbox e atualiza a lista de nomes
					dropbox.getFile("streamers.json", (contents) => {
						
						let a = JSON.parse(contents);
						let userinfo = JSON.parse(b)["data"][0];
						if(a.includes(userinfo["login"])){
							
							a = a.filter((v, i, a) => v != userinfo["login"]);
							dropbox.updateFile("streamers.json", JSON.stringify(a), () => {
								console.log("Removed user " + userinfo["login"] + " from our list");
								process.exec("npm start");
								process.exit(0);
								
							});
													
						}
					});
					;
				})
			}).end();
		})

		res.render("remchannel");
	}).end();
	
	
});

app.listen(process.env.PORT || 80, () => {
	console.log("server started on port " + (process.env.PORT || 80) + " | Environment: " + environment);
});

