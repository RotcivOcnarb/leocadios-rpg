const database = require("./database");
const dropbox = require("./drive_api");

let rewards = {};

dropbox.getFile("rewards.json", (contents) => {
	try{
		rewards = JSON.parse(contents);
	}
	catch{
		console.log("Could not parse JSON for contents: ");
		console.log(contents);
	}
});


let funcs = {
	"reviver_personagem": function(say, context, streamer){
		let character = database.retrieveCharacterData(context["user-id"], streamer);
		character.health = character.getAttribute("max_health");
		say("O personagem de " + character.display_name + " foi completamente recuperado!");
	}
}

module.exports = {
	
	query: function(reward_id, say, context, streamer){
		if(rewards[streamer]){
			if(rewards[streamer][reward_id]){
				funcs[rewards[streamer][reward_id]](say, context, streamer);
			}
		}
	}
	
}