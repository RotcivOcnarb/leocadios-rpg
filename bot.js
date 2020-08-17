const tmi = require('tmi.js');
const database = require("./database");
const Character = require("./character");
const combat = require("./combat");
const twitch = require("./twitch_api");
const worlds = require("./worlds");
const items = require("./items");

let display_names = {};
let view_count = 0;
let lastActivity = {};
let lastTutorialMessage = 0;

let REVIVER_REWARD = "39f8f088-4456-4785-96bb-72e9cc5b8f69";

let client;

function init(environment){
	
	// Define configuration options
	const opts = {
	  identity: {
		username: "RotsBots",
		password: "oauth:o8ut98dsvn59t5hqynkhlm6o4x8yz6"
	  },
	  channels: [
		(environment == "production" ? "RotsBots" : "RotcivOcnarb")
	  ]
	};

	// Create a client with our options
	client = new tmi.client(opts);
	client.say_2 = client.say;
	client.say = function(channel, message){
		console.log("-> " + message + "\n--");
		client.say_2(channel, message);
	}

	// Register our event handlers (defined below)
	client.on('message', onMessageHandler);
	client.on('connected', onConnectedHandler);
	client.on("raw_message", onRawMessage);
	client.on("whisper", (from, userstate, message, self) => {
		// Don't listen to my own messages..
		if (self) return;
		
		
		
		console.log("Recebi um whisper de " + from );
		
		client.whisper("RotcivOcnarb", "Sua mensagem foi: ");
		client.whisper("RotcivOcnarb", message);

		// Do your stuff.
	});

	database.loadDatabase();

	// Connect to Twitch:
	client.connect();

	setInterval(database.saveDatabase, 1000 * 30);
	setInterval(() => {
		twitch.getLiveViewCount((count) => {
			view_count = count;
		})
	}, 5000);

	/* AVISO PRA DAR AOS VIEWERS

	Alguns sistemas automaticos requerem que o usuário esteja ativo na live, por isso, se você ficar sem comentar nada por mais de 5 minutos, mesmo que esteja vendo a live, o sistema vai identificar que você está OFFLINE, e não vai te dar alguns bonus:

	- Recuperação de vida

	*/

	setInterval( () => {
		//Aumenta a vida de todo mundo a cada 10 segundos se ele não estiver em combate, e ele estiver na live
		let allCharacters = database.getAllCharacters();
		
		for(var i in Object.keys(allCharacters)){
			var k = Object.keys(allCharacters)[i];
			var ch = allCharacters[k];
			
			if(!combat.isPlayerInCombat(ch)){
				if(lastActivity[ch.twitch_id] && (Date.now() - lastActivity[ch.twitch_id]) < 1000 * 60 * 5){
					ch.health += (0.1 * ch.getAttribute("max_health"));
					ch.health = Math.min(Math.floor(ch.health), ch.getAttribute("max_health"));
				}
			}
		}
		
	}, 30 * 1000);

}

// Called every time a message comes in
async function onMessageHandler (channel, context, msg, self) {
	if(self && msg == ">botid") console.log(JSON.stringify(context, null, 2));
	if (self) { return; } // Ignore messages from the bot
	
	let moderator = context.mod || (context.badges && context.badges.broadcaster == "1");
  
	lastActivity[context["user-id"]] = Date.now();
	
	if(msg == ">botid"){
		client.say(channel, ">botid");
	}
	
	if(msg == ">context"){
		console.log(JSON.stringify(context, null, 2));
	}
	
	if(moderator){
		let allCharacters = database.getAllCharacters();
		
		if(msg.startsWith(">deletar")){
			let tok = msg.split(" ");
						
			if(tok.length >= 2){
				
				client.say(channel, "o personagem de " + allCharacters[tok[1]].display_name + " foi DELETADO!");
				delete allCharacters[tok[1]];
				database.saveDatabase();
			}
		}
		
		if(msg.startsWith(">dar")){
			let tok = msg.split(" ");
						
			if(tok.length >= 3){
			
				let item_id = tok[1];
				let user_id = tok[2];
				let stack = 1;
				
				if(tok.length == 4){
					stack = Number(tok[3]);
				}

				if(allCharacters[user_id] && items[item_id]){
					allCharacters[user_id].giveItem(item_id, stack);
				}
				client.say(channel, "Sucesso! Um moderador deu à " + user_id + " " + stack + " items [" + items[item_id].display_name + "]");
			}
		}
		
		if(msg.startsWith(">editar")){
			let tok = msg.split(" ");
			
			if(tok.length == 4){
				
				let item_id = tok[1];
				let attribute = tok[2];
				
			}
		}
		
		if(msg.startsWith(">upar")){
			let tok = msg.split(" ");
			
			if(tok.length == 2){
				allCharacters[tok[1]].levelUp(display_names[tok[1]]);
				client.say(channel, display_names[tok[1]] + " acaba de UPAR DE NÍVEL, e agora está no nível " + allCharacters[tok[1]].level + "!");
			}
		}
	}

  
	display_names[context["user-id"]] = context['display-name'];
	let display_name = context['display-name'];
  	  
	if(msg == ">criar personagem"){
		if(database.createNewCharacter(context["user-id"], context.subscriber, moderator)){
			client.say(channel, `Personagem de ${display_name} criado com sucesso! Bem-vindo ao RPG do Gui Leocádio!`);
		}
		else{
			client.say(channel, `Desculpe, não conseguimos criar um novo personagem para você. Será que já não existe um personagem criado na sua conta? Use o comando >character para ver o seu personagem!`);
		}
	}
	  
	let character = database.retrieveCharacterData(context["user-id"]);
	
	if(msg == ">id"){
		client.say(channel, context["user-id"]);
	}
	  
	if(msg == ">personagem"){

		if(character){
			client.say(channel, "Para ver os status do personagem de "+display_name+", acesse esse link: https://leocadios-rpg.herokuapp.com/?id=" + context["user-id"]);
		}
		else{
			client.say(channel, "Não conseguimos encontrar o seu personagem, para criar um novo personagem use o comando >criar personagem");
		}
	}
	
	if(msg == ">tutorial"){
		if(Date.now() - lastTutorialMessage > 1000 * 60){
			client.say(channel, "Bem-vindo ao RPG das Lives do Leocádio! Para começar é simples, crie um personagem com o comando >criar personagem");
			client.say(channel, "Depois de criar seu personagem, você pode lutar com os monstros do mundo usando o comando >lutar. Você também pode ver as informações de status e experiencia do seu personagem usando o comando >personagem");
			client.say(channel, "Você também pode lutar com o chefão do mundo usando o comando >boss, e caso queira novos desafios, use o comando >mundos");
			client.say(channel, "Para mais informações detalhadas sobre o RPG, acesse o documento de ajuda completo! [URL VAI VIR AQUI]");
			lastTutorialMessage = Date.now();
		}
	}

	if(msg == ">bonus"){
		client.say(channel, "A live está atualmente com aproximadamente " + view_count + " espectadores! Isso dá um bonus de " + (view_count*10) + "% em todo o XP e moedas ganhos durante a live!");
	}

	if(character){
		
		character.display_name = display_name;
		
		if(context["custom-reward-id"]){
			if(context["custom-reward-id"] == REVIVER_REWARD){
				client.say(channel, "O personagem de " + display_name + " foi completamente recuperado!");
				character.health = character.getAttribute("max_health");
			}
		}
		
		if(msg == ">lutar"){
			combat.engageCombatRandom(character, display_name, client, channel, view_count);
		}
		
		if(msg.startsWith(">item")){
			if(!combat.isPlayerInCombat(character)){
				
				let tok = msg.split(" ");
				
				if(tok.length >= 2){
					if(character.inventory[tok[1]]){
						
						if(items[tok[1]].type == "consumable"){
							items[tok[1]].consume(character, tok);
							character.inventory[tok[1]].stack --;
							if(character.inventory[tok[1]].stack <= 0){
								delete character.inventory[tok[1]];
							}
							client.say(channel, "Você consome o item " + items[tok[1]].display_name);
						}
						else{
							client.say(channel, "O item " + items[tok[1]].display_name + " não é consumível!");
						}
						
					}
					else{
						client.say(channel, "Não consegui encontrar o item " + tok[1] + " no inventário de " + display_name);
					}
				}
				
			}
			else{
				client.say(channel, "Você não pode usar itens durante um combate!");
			}
		}
		
		if(msg.startsWith(">equipar")){
			if(!combat.isPlayerInCombat(character)){
				let tok = msg.split(" ");
				
				if(tok.length >= 2){
					if(character.inventory[tok[1]]){
						
						if(items[tok[1]].type == "equipment"){
							items.equip(character, tok[1]);
							client.say(channel, "Você equipou o item " + items[tok[1]].display_name);
						}
						else{
							client.say(channel, "O item " + items[tok[1]].display_name + " não é equipável!");
						}
						
					}
					else{
						client.say(channel, "Não consegui encontrar o item " + tok[1] + " no inventário de " + display_name);
					}
				}
			}
			else{
				client.say(channel, "Você não pode equipar itens durante um combate!");
			}
		}
		
		if(msg == ">correr"){
			combat.flee(character, display_name, client, channel);
		}
		
		if(msg == ">log"){
			console.log(display_name + " requisitou o log");
			combat.printCombatLog(character, display_name, client, channel);
		}
		
		if(msg == ">boss"){
			combat.engageCombatWithBoss(character, display_name, client, channel, view_count);
		}
		  
		if(msg == ">mundos"){
			let speech = " == MUNDOS DISPONÍVEIS == ";
			for(i in Object.keys(worlds)){
				let key = Object.keys(worlds)[i];
				let w = worlds[key];
				if(w.display_name){
					speech += w.display_name + " [" + key + "]: Nivel " + w.level_range[0] + " até " + w.level_range[1] + " == ";
				}
			}
			speech += " == Para teleportar para um mundo, use o comando >mundo nome_do_mundo";
			client.say(channel, speech);
		}
		
		if(msg.startsWith(">mundo")){
			let ks = msg.split(" ");
			if(ks.length > 1){
				if(worlds[ks[1]]){
					character.world = ks[1];
					client.say(channel, "Bem-vindo à(o) " + worlds[character.world].display_name + ", " + display_name + "!");
				}
				else{
					client.say(channel, "Desculpe, não conheço esse mundo \"" + ks[1] + "\" que você diz. Para ver a lista de todos os mundos, use o comando >mundos");
				}
			}
			else if(msg == ">mundo"){
				client.say(channel, display_name + " está atualmente no mundo " + worlds[character.world].display_name + " [" + character.world + "]. Para mudar de mundo, use o comando >mundo nome_do_mundo");
			}
		}
	}  
}


function onRawMessage(messageCloned, message){
	
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

module.exports = init;