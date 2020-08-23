let fs = require("fs");

let funcs = {
	heal: function(character, params){
		character.health += Number(params[1]);
		character.health = Math.min(character.health, character.getAttribute("max_health"));
	},
	boost: function(character, params){
		character[params[1]] += params[2];
		
		setTimeout(() => {
			character[params[1]] -= params[2];
			character.revalidate();
		}, Number(params[3]));
	}
	
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
	"consume": function(character, item){
		let eq = items[item];
		if(eq.consume){
			if(character.removeItem(item, 1)){
				let toks = eq.consume.split(" ");
				funcs[toks[0]](character, toks);
			}
		}
	}
}

let consumables = JSON.parse(fs.readFileSync('data/consumables.json', 'utf-8'));
items = Object.assign(items, consumables);

let armors = JSON.parse(fs.readFileSync('data/armors.json', 'utf-8'));
items = Object.assign(items, armors);

let weapons = JSON.parse(fs.readFileSync('data/weapons.json', 'utf-8'));
items = Object.assign(items, weapons);

module.exports = items;