let database = require("./database");

module.exports = class Character {
	
	constructor(twitch_id){
		this.twitch_id = twitch_id;
		this.attack = 50;
		this.defense = 10;
		this.critic = 0.05; //de 0-1
		this.versatility = 5; //de 0-1
		this.velocity = 10;
		this.max_health = 100;
		this.health = 100;
		this.level = 1;
		this.experience = 0;
		this.max_experience = 100;
		
		this.world = "vale_da_lua";
		this.coins = 0;
		
		this.head_slot = {};
		this.torso_slot = {};
		this.weapon_slot = {};
		this.pants_slot = {};
		this.shoes_slot = {};
		this.gloves_slot = {};
		this.trinket_slot = {};
		
		this.inventory = {};
	}
	
	levelUp(display_name){
		this.experience -= this.max_experience;
		this.level ++;
		this.max_experience *= 1.2;
		this.max_experience = Math.floor(this.max_experience);
		
		//Aumenta o status do player
		this.max_health *= 1.1; this.max_health = Math.floor(this.max_health);
		this.attack *= 1.05; this.attack = Math.floor(this.attack);
		this.defense *= 1.1; this.defense = Math.floor(this.defense);
		this.velocity *= 1.1; this.velocity = Math.floor(this.velocity);
		
		this.health = this.max_health;
	}
	
	description(display_name){
		return [ 
			"=== " + display_name + " === " + " | " + 
			"ATK: " + this.attack + " | " + 
			"DEF: " + this.defense + " | " + 
			"CRITICO: " + (this.critic * 100) + "%" + " | " + 
			"VERSATILIDADE: " + this.versatility + " | " + 
			"VELOCIDADE: " + this.velocity + " | " + 
			"VITALIDADE: " + this.max_health + " | " + 
			"VIDA: " + this.health + "/" + this.max_health + " | " + 
			"NÍVEL: " + this.level + " | " + 
			"EXP: " + this.experience + "/" + this.max_experience + " | " + 
			"DINHEIRO: " + this.coins
		 ];
	}
	
	equip_description(obj){
		//Descrição do equipamento
	}
	
}