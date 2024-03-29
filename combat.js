let combats = {}; //Todas as batalhas sendo feitas atualmente
let combat_logs = {};
const worlds = require("./data/worlds.json");
const enemies = require("./data/enemies.json");
const items = require("./items");

function engageCombatWithBoss(character, say, view_count){
	let world = worlds[character.world];
	let enemy = enemies[world.boss];
	engageCombat(character, say, view_count, enemy, true);
}

function engageCombatRandom(character, say, view_count){
	let world = worlds[character.world];
	
	let l = clamp(character.level, world.level_range[0], world.level_range[1]);

	let enemy = enemies[rng_array(world.enemies)];
	while(enemy.level != l) enemy = enemies[rng_array(world.enemies)];
	
	engageCombat(character, say, view_count, enemy, false);

}

function engageCombat(character, say, view_count, enemy, boss){
	if(combats[character.twitch_id]){
		let remaining = combats[character.twitch_id].duration - Math.floor((Date.now() - combats[character.twitch_id].timestamp)/1000);
		say(character.display_name + ", você JÁ ESTÁ em um combate! Ainda restam mais " + remaining + " segundos para seu combate terminar. Você pode fugir durante esse tempo usando o comando >correr");
		//Já tá num combate
		return false;
	}
	else{
		//Checa se ele não tá morto
		if(character.health <= 0){
			say(character.display_name + ", você não pode entrar em um combate pois você está MORTO, espere sua vida encher enquanto assiste a live!");
			return false;
		}
		
		let world = worlds[character.world];
		let wait = (20 + (boss ? 30 : 10)*enemy.level);
		
		if(character.mod) wait /= 10;
		else if(character.sub) wait /= 2;
		
		let combat = {
			"character": character,
			"enemy":  enemy,
			"world": character.world,
			"enemy_health": enemy.max_health,
			"timestamp": Date.now(),
			"duration": wait
		};
		
		
		let combat_log = [];
		
		combat_logs[character.twitch_id] = combat_log;
		combats[character.twitch_id] = combat;

		let ps = false;
		
		if(enemy.velocity == character.velocity)
			ps = Math.random() < 0.5;
		else if(enemy.velocity > character.velocity)
			ps = false;
		else if(enemy.velocity < character.velocity)
			ps = true;
		
		
		
		let speech = character.display_name + " acaba de encontrar um " + enemy.display_name.toUpperCase() + " de nível " + enemy.level + "! --- A batalha durará " + wait + " segundos";
		
		say(speech);
				
		setTimeout( () => {
			speech = "";
			if(!ps){
				let r = enemyAct(character, say, combat_log, boss);
				if(r && r.result == "lost"){
					speech += character.display_name + " está MORTO. Para recuperar vida, continue assistindo a live! -- Gostaria de ver o log de batalha? use o comando >log";
					say(speech);
					return;
				}
				if(r && result == "error"){
					say(character.display_name + " tentou MATAR o rotsbots com suas bruxarias e comandos errados. Não sei o que houve, mas sua batalha foi cancelada, se fode ae");
				}
			}

			let xa = character.getAttribute("velocity");
			let xb = enemy.velocity;

			//enquanto um dos dois não morrer:
			for(var rounds = 0; rounds < 30; rounds++){
				
				//Calcula de quem é o próximo round
				let result;
				let dim = Math.min(xa, xb);
				if(xa > xb) result = attack(character, say, view_count, combat_log, boss);
				else if(xb > xa) result = enemyAct(character, say, combat_log, boss);
				else if(Math.random() < 0.5) result = attack(character, say, view_count, combat_log, boss);
				else result = enemyAct(character, say, combat_log, boss);
			
				//Checa se alguem ganhou
				if(result){
					if(result.result == "win"){
						speech += character.display_name + " matou " + enemy.display_name.toUpperCase() +"! Ele ganhou " + result.exp + " pontos de experiência e " + result.cns + " moedas! ("+result.view_bonus+"% BONUS!) -- Gostaria de ver o log de batalha? use o comando >log";
						break;
					}
					else if(result.result == "lost"){
						speech += character.display_name + " está MORTO. Para recuperar vida, continue assistindo a live! -- Gostaria de ver o log de batalha? use o comando >log";
						break;
					}
					else{
						speech += "Resultado inesperado?? \n" + JSON.stringify(result);
						delete combats[character.twitch_id];
						break;
					}
				}
				
				xa -= dim;
				xb -= dim;

				if(xa <= 0) xa += character.getAttribute("velocity");
				if(xb <= 0) xb += enemy.velocity;
			}
			if(rounds == 30) speech += character.display_name + " demorou muito para matar o inimigo, e ele fugiu";
			say(speech);
				
		}, wait * 1000);

		return true;
	}
}

function enemyAct(character, say, combat_log, boss){
	let combat = combats[character.twitch_id];
	if(!combat) return {"result": "error"};
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
	let dmg = Math.floor(enemy.attack + rand_range(0, enemy.versatility));
	dmg = Math.max(0, dmg);
	if(Math.random() < enemy.critic){
		dmg *= 2;
		cr = true;
	}
	let rec = dmg - Math.floor(character.getAttribute("defense")*Math.random());
	
	if(rec <= 0){
		//MISS
		combat_log.push("O inimigo " + enemy.display_name.toUpperCase() + " ataca " + character.display_name + ", porém ele ERRA o ataque!")
	}
	else{
		combat_log.push("O inimigo " + enemy.display_name.toUpperCase() + " ataca " + character.display_name + ", causando " + rec + " de dano!" + (cr ? "[CRÍTICO]" : ""));
		
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

function attack(character, say, view_count, combat_log, boss){	
	let combat = combats[character.twitch_id];
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
	let dmg = Math.floor(character.getAttribute("attack") + rand_range(0, character.getAttribute("versatility")/2));
	dmg = Math.max(0, dmg);
	if(Math.random() < character.getCriticPercentage()){
		dmg *= 2;
		cr = true;
	}
	let rec = dmg - Math.floor(Math.random() * enemy.defense)
	
	if(rec <= 0){
		//MISS
		combat_log.push(character.display_name  + " ataca " + enemy.display_name.toUpperCase() + ", porém ele ERRA o ataque!");
		return enemyAct(character, say, combat_log, boss);
	}
	else{
		combat_log.push(character.display_name  + " ataca " + enemy.display_name.toUpperCase() + ", causando " + rec + " de dano!" + (cr ? " [CRÍTICO]" : ""));
		
		combat.enemy_health -= rec;
		
		if(combat.enemy_health <= 0){
			//Inimigo MORRE
			//encerra o combate e recompensa o jogador
			delete combats[character.twitch_id];
			
			let view_bonus = (view_count * 100);
			
			if(character.mod) view_bonus *= 4;
			if(character.sub) view_bonus *= 2;
			
			let exp = Math.floor((view_bonus/100.0 + 1) * enemy.exp);
			let cns = Math.floor((view_bonus/100.0 + 1) * enemy.coins);
			
			character.experience += exp;
			character.coins += cns;
			
			while(character.experience >= character.max_experience){
				character.levelUp();
				say(character.display_name + " acaba de UPAR DE NÍVEL, e agora está no nível " + character.level + "!");
			}
			
			let drops = [];
						
			let drop = [];
			if(boss) drop = worlds[combat.world].drop.boss;
			else drop = worlds[combat.world].drop[enemy.level];
			
			if(drop){
				for(i in drop){
					let rng = Math.random();
					if(rng < worlds[combat.world].drop_rate){
						character.giveItem(drop[i], 1);
						drops.push(drop[i]);
					}
				}
			}
			
			if(drops.length > 0)
				say(enemy.display_name + " acaba de dropar os itens: " + drops.map((el) => "[" + items[el].display_name + "]").join(", "));
			
			return {
				"result": "win",
				"exp": exp,
				"cns": cns,
				"view_bonus": view_bonus
			};
		}
		
	}
}

function flee(character, say){
	
	if(isPlayerInCombat(character)){
		let combat = combats[character.twitch_id];
		let enemy = combat.enemy;	
		
		say(character.display_name + " fica com medo e corre de " + enemy.display_name.toUpperCase() + ". Que medroso");
		
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
		
		say(character.display_name + frases[Math.floor(Math.random() * frases.length)]);
	}
	
}

function printCombatLog(character, say){
	let log = combat_logs[character.twitch_id];
	if(log){
		let speech = "";
		for(var i = 0; i < log.length; i ++){
			speech += log[i] + " -|- ";
		}
		say(speech);
	}
	else{
		say("Desculpa " + character.display_name + ", mas não houve nenhuma batalha recente");
	}
}


function isPlayerInCombat(character){
	return combats[character.twitch_id] ? true : false;
}

function rng_obj(obj){
	let a = rng_array(Object.keys(obj));
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