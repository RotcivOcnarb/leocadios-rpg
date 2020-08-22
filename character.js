let items = require("./items");
let analytics = require("./analytics");
var crypto = require('crypto');

let environment = (process.env.NODE_ENV || "development");

module.exports = class Character {
	
	constructor(twitch_id){
		this.twitch_id = twitch_id;		
		
		this.attack = 50;
		this.defense = 10;
		this.critic = 10;
		this.versatility = 5;
		this.velocity = 10;
		this.max_health = 100;
		this.health = 100;
		this.level = 1;
		this.experience = 0;
		this.max_experience = 80;
		this.sub = false;
		this.mod = false;
		
		this.world = "vale_da_lua";
		this.coins = 0;
		this.morcs = 0;
		
		this.head;
		this.torso;
		this.pants;
		this.shoes;
		
		this.weapon;
		
		this.trinket = [];
		
		this.inventory = {};
	}
	
	getAttribute(attr){
		let att = this[attr];
		
		let slots = ["head", "torso", "weapon", "pants", "shoes", "gloves"];
		
		for(var i in slots){
			slots[i];
			
			if(this[slots[i]]){
				att += items[this[slots[i]]][attr];
			}
		}
		return att;
	}
	
	revalidate(){
		if(this.health > this.getAttribute("max_health")){
			this.health = this.getAttribute("max_health");
		}
	}
	
	getCriticPercentage(){
		return (1 / (-(this.getAttribute("critic")/700 + 2)) + 0.5) * 2;
	}
	
	levelUp(){
		this.experience -= this.max_experience;
		
		if(this.experience < 0) this.experience = 0; //pra caso algum mod upar sem ter a exp
		
		this.level ++;
		this.max_experience *= 1.2;
		this.max_experience = Math.floor(this.max_experience);
		
		//Aumenta o status do player
		this.max_health *= 1.1; this.max_health = Math.floor(this.max_health);
		this.attack *= 1.1; this.attack = Math.floor(this.attack);
		this.defense *= 1.1; this.defense = Math.floor(this.defense);
		this.velocity *= 1.1; this.velocity = Math.floor(this.velocity);
		
		this.health = this.getAttribute("max_health");
		
		var shasum = crypto.createHash('sha1');
		shasum.update(this.twitch_id);
		
		analytics.event({
			ec: "character",
			ea: "level_up",
			uid: shasum.digest('hex'),
			cd1: environment,
			cd2: this.level,
			cd3: process.app_version,
			cm1: this.getAttribute("attack"),
			cm2: this.getAttribute("defense"),
			cm3: this.getAttribute("critic"),
			cm4: this.getAttribute("versatility"),
			cm5: this.getAttribute("velocity"),
			cm6: this.getAttribute("max_health")
			
		}).send();
	}
	
	giveItem(item, amount){
		if(this.inventory[item]){
			this.inventory[item].stack += amount;
		}
		else{
			this.inventory[item] = { "stack": amount };
		}
	}
	
	removeItem(item, amount){
		if(this.inventory[item]){
			this.inventory[item].stack -= amount;
			if(this.inventory[item].stack <= 0) delete this.inventory[item];
			return true;
		}
		return false;
	}
	
}