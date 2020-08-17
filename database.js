let allCharacters = {};
const fs = require("fs");
const Character = require("./character");

let exp = {
	
	"getAllCharacters": () => allCharacters,
	
	"loadDatabase": function(){
		fs.readFile("database.json", "utf8", (err, data) => {
			if (err) return console.log(err);
			allCharacters = JSON.parse(data);
			
			for(prop in Object.keys(allCharacters)){
				let k = Object.keys(allCharacters)[prop];
				
				let instance = new Character("");
				Object.assign(instance, allCharacters[k]);
				allCharacters[k] = instance;
			}
		});
	},

	"saveDatabase": function(){
		fs.writeFile("database.json", JSON.stringify(allCharacters), "utf8", (err) => {
			if (err) return console.log(err);
		});
	},

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