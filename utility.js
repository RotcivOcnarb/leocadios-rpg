let lodash = require('lodash');
let fs = require("fs");
const { Image } = require('image-js');

function getWeight(slot, attr){
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
	
	return weight[attr];
}

function generateItem(name, slot, level, thumbnail, desc){

	return {
		"display_name": name,
		"type": "equipment",
		"slot": slot,
		"thumbnail": thumbnail,
		"description": desc,
		"attack": Math.floor(level * 3 * getWeight(slot, "attack")),
		"defense": Math.floor(level * 2 * getWeight(slot, "defense")),
		"critic": Math.floor(level * 1 * getWeight(slot, "critic")),
		"versatility": Math.floor(level * 1 * getWeight(slot, "versatility")),
		"velocity": Math.floor(level * 3 * getWeight(slot, "velocity")),
		"max_health": Math.floor(level * 3 * getWeight(slot, "max_health")),
		"level": level
	}
}

const armors = require("./data/armors.json");
const weapons = require("./data/weapons.json");
const consumables = require("./data/consumables.json");

for(var a in Object.keys(armors)){
	let key = Object.keys(armors)[a];
	let armor = armors[key];
	
	armor.shop_price = Math.floor(Math.pow(armor.level, 1.3) * 100 * (Math.random() * 0.2 - 0.1 + 1));
	armors[key] = armor;
}

fs.writeFile("data/armors.json", JSON.stringify(armors, null, 2), ()=> console.log("Armors"));

for(var a in Object.keys(weapons)){
	let key = Object.keys(weapons)[a];
	let weapon = weapons[key];
	
	weapon.shop_price = Math.floor(Math.pow(weapon.level, 1.3) * 100 * (Math.random() * 0.2 - 0.1 + 1));
	weapons[key] = weapon;
}

fs.writeFile("data/weapons.json", JSON.stringify(weapons, null, 2), ()=> console.log("Weapon"));