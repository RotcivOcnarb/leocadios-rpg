module.exports = {
	"pocao_pequena": {
		"display_name": "Poção Pequena",
		"type": "consumable",
		"description": "Uma pequena poção vermelha que recupera 30 pontos de vida",
		"thumbnail": "/assets/icons/potion_01a.png",
		"consume": function(character){
			character.health += 30;
			character.health = Math.min(character.health, character.max_health);
		}
	},
	"pocao_media": {
		"display_name": "Poção Média",
		"type": "consumable",
		"thumbnail": "/assets/icons/potion_02a.png",
		"description": "Uma poção vermelha que recupera 100 pontos de vida",
		"consume": function(character){
			character.health += 100;
			character.health = Math.min(character.health, character.max_health);
		}
	},
	"pocao_grande": {
		"display_name": "Poção Grande",
		"type": "consumable",
		"thumbnail": "/assets/icons/potion_03a.png",
		"description": "Uma grande poção vermelha que recupera 200 pontos de vida",
		"consume": function(character){
			character.health += 200;
			character.health = Math.min(character.health, character.max_health);
		}
	}
}