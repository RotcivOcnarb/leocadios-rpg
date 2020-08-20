const express = require("express");
const app = express();
const path = require("path");
const database = require("./database");
const items = require("./items");
const https = require("https");

let environment = (process.env.NODE_ENV || "development");

require("./bot")(environment); //Inicia o bot da twitch

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/personagem", (req, res) => {
	
	if(req.query["id"]){
		let twitch_id = req.query["id"];
		let allCharacters = database.getAllCharacters();
		
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

app.get("/ping", (req, res) => {
	
	https.request({
		hostname: "rpg-ping-pong.herokuapp.com",
		path: "/pong",
		method: "GET"
	}).end();	
	
});

app.listen(process.env.PORT || 80, () => {
	console.log("server started on port " + (process.env.PORT || 80) + " | Environment: " + environment);
});

