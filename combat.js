let combats = {}; //Todas as batalhas sendo feitas atualmente
let combat_logs = {};
const worlds = require("./worlds");

function engageCombatWithBoss(character, display_name, client, channel, view_count){
	let world = worlds[character.world];
	let enemy = world.boss;
	engageCombat(character, display_name, client, channel, view_count, enemy, true);
}

function engageCombatRandom(character, display_name, client, channel, view_count){
	let world = worlds[character.world];
	let enemy = rng_array(world.enemies);
	engageCombat(character, display_name, client, channel, view_count, enemy, false);

}

function engageCombat(character, display_name, client, channel, view_count, enemy, boss){
	if(combats[character.twitch_id]){
		let remaining = combats[character.twitch_id].duration - Math.floor((Date.now() - combats[character.twitch_id].timestamp)/1000);
		client.say(channel, display_name + ", você JÁ ESTÁ em um combate! Ainda restam mais " + remaining + " segundos para seu combate terminar. Você pode fugir durante esse tempo usando o comando >correr");
		//Já tá num combate
		return false;
	}
	else{
		//Checa se ele não tá morto
		if(character.health <= 0){
			client.say(channel, display_name + ", você não pode entrar em um combate pois você está MORTO, espere sua vida encher enquanto assiste a live!");
			return false;
		}
		
		let world = worlds[character.world];
		let rand_n = Math.floor(rand_range(-1, 2))
		let enemy_level = clamp(character.level + rand_n, world.level_range[0], world.level_range[1]);
		if(boss) enemy_level = world.level_range[1];
		let x = enemy_level;
		let wait = (20 + (boss ? 30 : 10)*enemy_level);
		
		let combat = {
			"character": character,
			"enemy":  enemy,
			"enemy_level": enemy_level,
			"enemy_health": eval(enemy.max_health),
			"timestamp": Date.now(),
			"duration": wait
		};
		
		let combat_log = [];
		
		combat_logs[character.twitch_id] = combat_log;
		combats[character.twitch_id] = combat;
		

		let ps = false;
		
		if(eval(enemy.velocity) == character.velocity)
			ps = Math.random() < 0.5;
		else if(eval(enemy.velocity) > character.velocity)
			ps = false;
		else if(eval(enemy.velocity < character.velocity))
			ps = true;
		
		
		
		let speech = display_name + " acaba de encontrar um " + enemy.display_name.toUpperCase() + " de nível " + enemy_level + "! --- A batalha durará " + wait + " segundos";
		
		client.say(channel, speech);
		
		setTimeout( () => {
			if(!ps){
				enemyAct(character, display_name, client, channel, combat_log);
			}

			speech = "";
			
			//enquanto um dos dois não morrer:
			
			while(character.health > 0 && combat.enemy_health > 0){
				let result = attack(character, display_name, client, channel, view_count, combat_log);
				if(result){
					if(result.result == "win"){
						speech += display_name + " matou " + enemy.display_name.toUpperCase() +"! Ele ganhou " + result.exp + " pontos de experiência e " + result.cns + " moedas! ("+result.view_bonus+"% BONUS!) -- Gostaria de ver o log de batalha? use o comando >log";
						break;
					}
					else if(result.result == "lost"){
						speech += display_name + " está MORTO. Para recuperar vida, continue assistindo a live! -- Gostaria de ver o log de batalha? use o comando >log";
						break;
					}
				} //o próprio attack chama o enemy act
			}
			client.say(channel, speech);
				
		}, wait * 1000);

		return true;
	}
}

function enemyAct(character, display_name, client, channel, combat_log){
	let combat = combats[character.twitch_id];
	let x = combat.enemy_level;
	let enemy = combat.enemy;
	
	// Inimigo inicia o combate
			
	/*
	
	1- Calcula o dano que o player vai dar: ataque + rng(versatilidade)*ataque
	2- Checa se o dano é crítico, se sim dano *= 2
	3- Calcula o dano recebido pelo inimigo baseado na sua defesa, recebido = dano - defesa
	4- Se o recebido for <= 0, dá MISS
	5- Subtrai a vida do inimigo
	6- Se o inimigo morrer:	
		6a - Termina a batalha
		6b - Calcula a quantidade de XP do player baseado na quantidade de gente vendo a live
			xp% = views * 10 (10 pessoas = 100% de bonus, etc)
	
	*/
	
	let cr = false;
	let dmg = Math.floor(eval(enemy.attack) + rand_range(-eval(enemy.versatility), eval(enemy.versatility)));
	dmg = Math.max(0, dmg);
	if(Math.random() < eval(enemy.critic)){
		dmg *= 2;
		cr = true;
	}
	let rec = dmg - character.defense
	
	if(rec <= 0){
		//MISS
		combat_log.push("O inimigo " + enemy.display_name.toUpperCase() + " ataca " + display_name + ", porém ele ERRA o ataque!")
	}
	else{
		combat_log.push("O inimigo " + enemy.display_name.toUpperCase() + " ataca " + display_name + ", causando " + rec + " de dano!" + (cr ? "[CRÍTICO]" : ""));
		
		character.health -= rec;
		
		if(character.health < 0){
			//Player MORRE
			//encerra o combate e volta a vida
			character.health = 0;
			delete combats[character.twitch_id];
			return {
				"result": "lost"
			}		
		}
	}
}

function attack(character, display_name, client, channel, view_count, combat_log){
	let combat = combats[character.twitch_id];
	let x = combat.enemy_level;
	let enemy = combat.enemy;	
	
	/*
	
	1- Calcula o dano que o player vai dar: ataque + versatilidade*ataque
	2- Checa se o dano é crítico, se sim dano *= 2
	3- Calcula o dano recebido pelo inimigo baseado na sua defesa, recebido = dano - defesa
	4- Se o recebido for <= 0, dá MISS
	5- Subtrai a vida do inimigo
	6- Se o inimigo morrer:	
		6a - Termina a batalha
		6b - Calcula a quantidade de XP do player baseado na quantidade de gente vendo a live
			xp% = views * 10 (10 pessoas = 100% de bonus, etc)
	
	*/
	
	let cr = false;
	let dmg = Math.floor(character.attack + rand_range(-character.versatility, character.versatility));
	dmg = Math.max(0, dmg);
	if(Math.random() < character.critic){
		dmg *= 2;
		cr = true;
	}
	let rec = dmg - eval(enemy.defense)
	
	if(rec <= 0){
		//MISS
		combat_log.push(display_name  + " ataca " + enemy.display_name.toUpperCase() + ", porém ele ERRA o ataque!");
		return enemyAct(character, display_name, client, channel, combat_log);
	}
	else{
		combat_log.push(display_name  + " ataca " + enemy.display_name.toUpperCase() + ", causando " + rec + " de dano!" + (cr ? "[CRÍTICO]" : ""));
		
		combat.enemy_health -= rec;
		
		if(combat.enemy_health <= 0){
			//Inimigo MORRE
			//encerra o combate e recompensa o jogador
			delete combats[character.twitch_id];
			
			let view_bonus = (view_count * 10);
			let exp = Math.floor(view_bonus/100 + 1 * eval(enemy.exp));
			let cns = Math.floor(view_bonus/100 + 1 * eval(enemy.coins));
			
			character.experience += exp;
			character.coins += cns;
			
			while(character.experience > character.max_experience){
				character.levelUp(display_name);
				client.say(channel, display_name + " acaba de UPAR DE NÍVEL, e agora está no nível " + character.level + "!");
			}
			
			return {
				"result": "win",
				"exp": exp,
				"cns": cns,
				"view_bonus": view_bonus
			};
		}
		else{
			return enemyAct(character, display_name, client, channel, combat_log);
		}
	}
}

function flee(character, display_name, client, channel){
	
	if(isPlayerInCombat(character)){
		let combat = combats[character.twitch_id];
		let x = combat.enemy_level;
		let enemy = combat.enemy;	
		
		client.say(channel, display_name + " fica com medo e corre de " + enemy.display_name.toUpperCase() + ". Que medroso");
		
		delete combats[character.twitch_id];

	}
	else{
		
		let frases = [
			" tenta correr das suas responsabilidades, mas elas são mais rápidas",
			" está correndo que nem um bobo sem motivo algum",
			" começa a correr, mas no meio do caminho tropeça e cai no chão. Algumas pessoas viram. Elas estão rindo de você agora",
			" está correndo para praticar para a São Silvestre",
			" começa a correr. Correr do que? Ninguém sabe..."
		]
		
		client.say(channel, display_name + frases[Math.floor(Math.random() * frases.length)]);
	}
	
}

function printCombatLog(character, display_name, client, channel){
	let log = combat_logs[character.twitch_id];
	console.log("log de combate: " + log);
	if(log){
		let speech = "";
		for(var i = 0; i < log.length; i ++){
			speech += log[i] + " -|- ";
		}
		client.say(channel, speech);
	}
	else{
		client.say(channel, "Desculpa " + display_name + ", mas não houve nenhuma batalha recente");
	}
}


function isPlayerInCombat(character){
	return combats[character.twitch_id] ? true : false;
}

function rng_obj(obj){
	let a = rng_array(Object.keys(obj));
	console.log(a);
	return obj[a];
}

function rng_array(array){
	return array[Math.floor(Math.random() * array.length)];
}

function rand_range(min, max){
	return Math.random() * (max - min) + min;
}

function clamp(number, min, max){
	return Math.min(Math.max(number, min), max);
}

module.exports = {
	"engageCombatRandom": engageCombatRandom,
	"engageCombatWithBoss": engageCombatWithBoss,
	"enemyAct": enemyAct,
	"isPlayerInCombat": isPlayerInCombat,
	"attack": attack,
	"flee": flee,
	"printCombatLog": printCombatLog
}