const express = require("express");
const app = express();
const path = require("path");
const database = require("./database");
const items = require("./items");
const https = require("https");
const shop = require("./data/shop.json");
const dropbox = require("./drive_api");
const { exec } = require("child_process");

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
	
	res.render("button", {
		button_name: "Adicionar RPG Bot ao seu canal!",
		button_link: "https://id.twitch.tv/oauth2/authorize?client_id=mfko21ti9vhpzbpkgbb7lse4yxl7cu&redirect_uri=https://leocadios-rpg.herokuapp.com/authorize&response_type=code&scope=user:read:email"
	});

});

app.get("/removebot", (req, res) => {
	
	res.render("button", {
		button_name: "Remover RPG Bot do seu canal :(",
		button_link: "https://id.twitch.tv/oauth2/authorize?client_id=mfko21ti9vhpzbpkgbb7lse4yxl7cu&redirect_uri=https://leocadios-rpg.herokuapp.com/removesuccess&response_type=code&scope=user:read:email"
	});

});

app.get("/updatesubs", (req, res) => {
	
	res.render("button", {
		button_name: "Atualizar os personagens de Subs",
		button_link: "https://id.twitch.tv/oauth2/authorize?client_id=mfko21ti9vhpzbpkgbb7lse4yxl7cu&redirect_uri=https://leocadios-rpg.herokuapp.com/subupdated&response_type=code&scope=channel:read:subscriptions"
	});
	
});

app.get("/subupdated", (req, res) => {
	
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
				path: "/helix/subscriptions",
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
							
							//ATUALIZAR OS SUBS
							dropbox.getFile(`database_production_${userinfo.login}.json`, (contents) => {
								let chars = JSON.parse(contents);
								
							});
							
							res.render("message", {
								message: "Subs atualizados!"
							});
						}
						res.render("message", {
							message: "Seu canal não tem o bot! Acesse <a href='https://leocadios-rpg.herokuapp.com/addbot'>esse link</a> para adicionar o bot ao seu canal"
						});
					});
					;
				})
			}).end();
		})

		
	}).end();
	
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
							
							res.render("message", {
								message: "O Bot foi adicionado ao seu canal com sucesso!"
							});
						}
						res.render("message", {
							message: "O Bot JÁ está no seu canal!"
						});
					});
					;
				})
			}).end();
		})

		
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
								exec("npm start");
								process.exit(0);
								
							});
									
							res.render("message", {
								message: "O bot foi removido do seu canal com sucesso!"
							});									
						}
						else{
							res.render("message", {
								message: "O BOT não está no seu canal!"
							});			
						}
					});
					;
				})
			}).end();
		})		
	}).end();
	
	
});

app.listen(process.env.PORT || 80, () => {
	console.log("server started on port " + (process.env.PORT || 80) + " | Environment: " + environment);
});

