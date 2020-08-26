let allCharacters = {};
const fs = require("fs");
const Character = require("./character");
const storage = require("./drive_api");

//teste git

let exp = {
	
	"getAllCharacters": (streamer) => allCharacters[`production_${streamer}`],
	
	"loadDatabase": (streamer) => storage.loadDatabase(`database_production_${streamer}`, function(data){
			
			if(data.error){
				console.log("ERROR loading database ["+`database_production_${streamer}`+".json]:");
				console.log(JSON.stringify(data, null, 2));
				allCharacters[`production_${streamer}`] = {};
				storage.saveDatabase(`database_production_${streamer}`, allCharacters[`production_${streamer}`]);
				
				return;
			}
			else{
				console.log("Loaded successfully database for streamer " + streamer);
				allCharacters[`production_${streamer}`] = data;
			}
			for(prop in Object.keys(allCharacters[`production_${streamer}`])){
				let k = Object.keys(allCharacters[`production_${streamer}`])[prop];
				
				let instance = new Character("");
				Object.assign(instance, allCharacters[`production_${streamer}`][k]);
				allCharacters[`production_${streamer}`][k] = instance;
			}
		}),

	"saveDatabase": (streamer) => storage.saveDatabase(`database_production_${streamer}`, allCharacters[`production_${streamer}`]),

	"createNewCharacter": function (twitch_id, sub, mod, streamer){
		
		if(!exp.retrieveCharacterData(twitch_id, streamer)){
			//CRIA UM PERSONAGEM NOVO
			let chr = new Character(twitch_id);
			chr.sub = sub;
			chr.mod = mod;
			allCharacters[`production_${streamer}`][twitch_id] = chr;
			
			exp.saveDatabase(streamer);
			return true; //Código pra sucesso
		}
		else return false; //Código pra fracasso: personagem já existe
		
	},

	"retrieveCharacterData": function (twitch_id, streamer){
		return allCharacters[`production_${streamer}`][twitch_id];
	},
	
};

module.exports = exp;