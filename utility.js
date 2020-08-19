let lodash = require('lodash');
let fs = require("fs");
const { Image } = require('image-js');

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
