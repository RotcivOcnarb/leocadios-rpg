let allCharacters = {};
const fs = require("fs");
const Character = require("./character");
const storage = require("./drive_api");

//teste git

let exp = {
	
	"getAllCharacters": (env, streamer) => allCharacters[`${env}_${streamer}`],
	
	"loadDatabase": (env, streamer) => storage.loadDatabase(`database_${env}_${streamer}`, function(data){
			allCharacters[`${env}_${streamer}`] = data;
			if(data.error){
				console.log("ERROR loading database ["+`database_${env}_${streamer}`+".json]:");
				console.log(JSON.stringify(data, null, 2));
				allCharacters[`${env}_${streamer}`] = {};
				storage.saveDatabase(`database_${env}_${streamer}`, allCharacters[`${env}_${streamer}`]);
				
				return;
			}
			for(prop in Object.keys(allCharacters[`${env}_${streamer}`])){
				let k = Object.keys(allCharacters[`${env}_${streamer}`])[prop];
				
				let instance = new Character("");
				Object.assign(instance, allCharacters[`${env}_${streamer}`][k]);
				allCharacters[`${env}_${streamer}`][k] = instance;
			}
		}),

	"saveDatabase": (env, streamer) => storage.saveDatabase(`database_${env}_${streamer}`, allCharacters[`${env}_${streamer}`]),

	"createNewCharacter": function (twitch_id, sub, mod, env, streamer){
		
		if(!exp.retrieveCharacterData(twitch_id, env, streamer)){
			//CRIA UM PERSONAGEM NOVO
			let chr = new Character(twitch_id);
			chr.sub = sub;
			chr.mod = mod;
			allCharacters[`${env}_${streamer}`][twitch_id] = chr;
			
			exp.saveDatabase(env, streamer);
			return true; //Código pra sucesso
		}
		else return false; //Código pra fracasso: personagem já existe
		
	},

	"retrieveCharacterData": function (twitch_id, env, streamer){
		return allCharacters[`${env}_${streamer}`][twitch_id];
	},
	
};

module.exports = exp;