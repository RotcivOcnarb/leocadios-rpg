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
			console.log("Database Saved");
		});
	},

	"createNewCharacter": function (twitch_id){
		
		if(!exp.retrieveCharacterData(twitch_id)){
			//CRIA UM PERSONAGEM NOVO
			allCharacters[twitch_id] = new Character(twitch_id);
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