let allCharacters = {};
const fs = require("fs");
const Character = require("./character");
const storage = require("./drive_api");

//teste git

let exp = {
	
	"getAllCharacters": () => allCharacters,
	
	"loadDatabase": (env) => storage.loadDatabase("database_"+env, function(data){
			allCharacters = data;
			if(data.error){
				console.log("ERROR loading database ["+"database_"+env+".json]:");
				console.log(JSON.stringify(data, null, 2));
				allCharacters = {};
				storage.saveDatabase("database_"+env, allCharacters);
				
				return;
			}
			for(prop in Object.keys(allCharacters)){
				let k = Object.keys(allCharacters)[prop];
				
				let instance = new Character("");
				Object.assign(instance, allCharacters[k]);
				allCharacters[k] = instance;
			}
		}),

	"saveDatabase": (env) => storage.saveDatabase("database_"+env, allCharacters),

	"createNewCharacter": function (twitch_id, sub, mod){
		
		if(!exp.retrieveCharacterData(twitch_id)){
			//CRIA UM PERSONAGEM NOVO
			allCharacters[twitch_id] = new Character(twitch_id);
			allCharacters[twitch_id].sub = sub;
			allCharacters[twitch_id].mod = mod;
			exp.saveDatabase();
			return true; //Código pra sucesso
		}
		else return false; //Código pra fracasso: personagem já existe
		
	},

	"retrieveCharacterData": function (twitch_id){
		return allCharacters[twitch_id];
	},

	"updateCharacterInDatabase": function (character){
		
	}
	
};

module.exports = exp;