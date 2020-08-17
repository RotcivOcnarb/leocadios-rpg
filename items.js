let lodash = require('lodash');
let fs = require("fs");
const { Image } = require('image-js');

function heal(character, amount){
	character.health += amount;
	character.health = Math.min(character.health, character.getAttribute("max_health"));
}

/*
fs.readFile("ESPADAS.tsv", 'utf-8', function(err, contents){
		
	let linhas = contents.split("\n");
	
	let ESPADAS = {};
	
	for(var i = 1; i < linhas.length; i++){
		let dt = linhas[i].split("\t");
		
		let img = dt[0];
		let name = dt[1];
		let desc = dt[2];
		let rank = dt[3];
		
		ESPADAS[lodash.snakeCase(name)] = generateItem(name, "weapon", rank, "/assets/icons/weapons/" + img + ".png", desc);
	}
	
	fs.writeFile('weapons.json', JSON.stringify(ESPADAS, null, 2), function (err) {
		if (err) return console.log(err);
		console.log('Arquivo salvo em weapons.json');
	});
	
});
*/

function generateItem(name, slot, level, thumbnail, desc){
	
	let weight = {
		"attack": 0,
		"defense": 0,
		"critic": 0,
		"versatility": 0,
		"velocity": 0,
		"max_health": 0,
	};
	
	switch(slot){
		case "weapon":
			weight.attack = 2;
			weight.critic = 2;
			weight.versatility = 1;
		break;
		case "head":
			weight.attack = 1;
			weight.defense = 1;
			weight.critic = 1;
			weight.versatility = 1;
			weight.velocity = 1;
			weight.max_health = 1;
		break;
		case "shoes":
			weight.defense = 1;
			weight.versatility = 2;
			weight.velocity = 3;
		break;
		case "torso":
			weight.defense = 3;
			weight.max_health = 3;
		break;
		case "pants":
			weight.attack = 2;
			weight.versatility = 3;
			weight.velocity = 1;
		break;
	}
	
	return {
		"display_name": name,
		"type": "equipment",
		"slot": slot,
		"thumbnail": thumbnail,
		"description": desc,
		"attack": Math.floor((1+ Math.random() - 0.5) * level * 10 * weight.attack),
		"defense": Math.floor((1+ Math.random() - 0.5) * level * 10 * weight.defense),
		"critic": Math.floor((1+ Math.random() - 0.5) * level * 10 * weight.critic),
		"versatility": Math.floor((1+ Math.random() - 0.5) * level * 10 * weight.versatility),
		"velocity": Math.floor((1+ Math.random() - 0.5) * level * 10 * weight.velocity),
		"max_health": Math.floor((1+ Math.random() - 0.5) * level * 10 * weight.max_health)
	}
}
/*

let armors = {};

for(var i = 0; i < 80; i ++){
	
	let slot_index = Math.floor(i/20);
	let slots = ["head", "torso", "pants", "shoes"];
	
	let rank = (i % 20);
	
	let name = lodash.snakeCase(slots[slot_index] + " rank " + rank);
	
	armors[name] = generateItem(slots[slot_index] + " rank " + rank, slots[slot_index], rank, "/assets/icons/armor/EquipmentIconsC"+(161+i)+".png");
	
}

fs.writeFile('armors_gen.json', JSON.stringify(armors, null, 2), function (err) {
  if (err) return console.log(err);
  console.log('Arquivo salvo em armors.json');
});


let letters = "abcdefghijklmnopqrstuv";

//Espadas

let sword_types = ["Espada", "Sabre", "Montante"];
let sword_material = ["Madeira", "Ferro", "Aço", "Ouro", "Rubi"];

let swords = {};

for(var i = 0; i < 5; i ++){
	let level = (5 * i) + 1;
	for(var j = 0; j < 3; j ++){
		let name = sword_types[j] + " de " + sword_material[i];
		let thumbnail = "/assets/icons/sword_0"+(j+1)+ letters.substring(i, i+1)+".png";
		swords[lodash.snakeCase(name)] = generateItem(name, "weapon", level, thumbnail);
	}
}

console.log(JSON.stringify(swords, null, 4));
*/

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

let armors = JSON.parse(fs.readFileSync('armors.json', 'utf-8'));
items = Object.assign(items, armors);

let weapons = JSON.parse(fs.readFileSync('weapons.json', 'utf-8'));
items = Object.assign(items, weapons);

console.log("Carregado " + Object.keys(items).length + " items");

module.exports = items;