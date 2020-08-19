let fs = require("fs");

function heal(character, amount){
	character.health += amount;
	character.health = Math.min(character.health, character.getAttribute("max_health"));
}

let items = {
	"equip": function equip(character, item){
		let eq = items[item];
		if(character.removeItem(item, 1)){
			if(character[eq.slot]){
				character.giveItem(character[eq.slot], 1);
			}
			character[eq.slot] = item;
		}
	},
	//Consumiveis
	"pocao_pequena": {
		"display_name": "Poção Pequena",
		"type": "consumable",
		"description": "Uma pequena poção vermelha que recupera 100 pontos de vida",
		"thumbnail": "/assets/icons/potion_01a.png",
		"consume": (character) => heal(character, 100)
	},
	"pocao_media": {
		"display_name": "Poção Média",
		"type": "consumable",
		"thumbnail": "/assets/icons/potion_02a.png",
		"description": "Uma poção vermelha que recupera 200 pontos de vida",
		"consume": (character) => heal(character, 200)
	},
	"pocao_grande": {
		"display_name": "Poção Grande",
		"type": "consumable",
		"thumbnail": "/assets/icons/potion_03a.png",
		"description": "Uma grande poção vermelha que recupera 500 pontos de vida",
		"consume": (character) => heal(character, 500)
	},
}

let armors = JSON.parse(fs.readFileSync('data/armors.json', 'utf-8'));
items = Object.assign(items, armors);

let weapons = JSON.parse(fs.readFileSync('data/weapons.json', 'utf-8'));
items = Object.assign(items, weapons);

module.exports = items;