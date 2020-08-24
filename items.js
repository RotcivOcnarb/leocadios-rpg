let fs = require("fs");

let funcs = {
	heal: function(character, params, item){
		character.health += Number(params[1]);
		character.health = Math.min(character.health, character.getAttribute("max_health"));
		return character.display_name + " teve sua vida recuperada em " + Number(params[1]) + " pontos de vida";
	},
	boost: function(character, params, item){
		
		character.boost.push({
			"timestamp": Date.now(),
			"attribute": params[1],
			"points": Number(params[2]),
			"duration": Number(params[3])
		});
		
		character[params[1]] += Number(params[2]);

		return character.display_name + " recebeu um bonus de " + params[2] + " pontos no atributo [" + params[1] + "] por " + Math.floor(Number(params[3]) / 1000) + " segundos";
	},
	drop: function(character, params, item){
		let rate = Number(params[1]);
		let dps = [];
		for(i in item.drops){
			if(Math.random() <= rate){
				character.giveItem(item.drops[i], 1);
				dps.push(items[item.drops[i]].display_name);
			}
		}
		return character.display_name + " abriu " + item.display_name + " e recebeu os items: " + JSON.stringify(dps);
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
				return funcs[toks[0]](character, toks, eq);
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