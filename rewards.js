const database = require("./database");
const dropbox = require("./drive_api");

let rewards = {};

dropbox.getFile("rewards.json", (contents) => {
	rewards = JSON.parse(contents);
});


let funcs = {
	"reviver_personagem": function(say, context, environment, streamer){
		let character = database.retrieveCharacterData(context["user-id"], environment, streamer);
		character.health = character.getAttribute("max_health");
		say("O personagem de " + character.display_name + " foi completamente recuperado!");
	}
}

module.exports = {
	
	query: function(reward_id, say, context, environment, streamer){
		if(rewards[streamer]){
			if(rewards[streamer][reward_id]){
				funcs[rewards[streamer][reward_id]](say, context, environment, streamer);
			}
		}
	}
	
}