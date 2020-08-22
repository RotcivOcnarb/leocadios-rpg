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

const shop = require("./data/shop.json");
const armors = require("./data/armors.json");
const weapons = require("./data/weapons.json");

for(var v in Object.keys(armors)){
	var k = Object.keys(armors)[v];
	
	shop["Ferreiro Tyson"].items.push(k);
}

for(var v in Object.keys(weapons)){
	var k = Object.keys(weapons)[v];
	
	shop["Ferreiro Tyson"].items.push(k);
}

fs.writeFile("./data/shop.json", JSON.stringify(shop, null, 2), (err) => console.log(err));