const express = require("express");
const app = express();
const path = require("path");
const database = require("./database");
const items = require("./items");

require("./bot")(); //Inicia o bot da twitch

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
	
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

app.listen(process.env.PORT || 5000, () => {
	console.log("server started on port " + (process.env.PORT || 5000));
});

