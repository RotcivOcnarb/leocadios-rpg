const database = require("./database");
const items = require("./items");
const combat = require("./combat");
const worlds = require("./data/worlds.json");
const shop = require("./data/shop.json");
const seedrandom = require("seedrandom");

function perm(command, context){
	if(command.role){
		if(command.role == "mod") return context.mod || (context.badges && context.badges.broadcaster == "1");
	}
	else return true;
}

let dt = new Date();
function randArray(array, count){
	let cpy = [...array];
	let res = [];
	
	if(array.length < count) return [];
	if(array.length == count) return cpy;
	
	for(var id = 0; id < count; id++){
		let rng = seedrandom.alea(dt.getDate() + "/" + dt.getMonth() + "/" + dt.getYear() + "-" + id).double();	
		let ii = Math.floor(rng * cpy.length);
		res.push(cpy[ii]);
		cpy.splice(ii, 1);
	}
			
	return res;
}

function checkForItemInShop(item){
	
	for(s in shop){
		let sh = shop[s];
		
		let shop_items = sh.items;	
		if(sh.type == "random")
			shop_items = randArray(sh.items, sh.item_count);
		
		if(shop_items.includes(item)){
			return items[item];
		}
	}
	
}

let funcs = {
	
	/* == COMANDOS DE MOD == */
	
	//Deleta um personagem especificado
	deletar: {
		"role": "mod",
		"params": 1,
		"exec": function(options){
			options.say("O personagem de " + options.allCharacters[options.tokens[1]].display_name + " foi DELETADO!");
			delete options.allCharacters[options.tokens[1]];
		}
	},
	
	//Dá um item pra um player especificado
	dar: {
		"role": "mod",
		"params": 2,
		"exec": function(options){
			let item_id = options.tokens[1];
			let user_id = options.tokens[2];
			let stack = Number(options.tokens[3] || 1);
			let c = options.allCharacters[user_id];
			if(c && items[item_id]){
				c.giveItem(item_id, stack);
			}
			options.say("Um moderador deu à " + c.display_name + " " + stack + " items [" + items[item_id].display_name + "]");
		}
	},
	
	/* == COMANDOS DE PERSONAGEM == */

	//Cria um personagem novo
	criar_personagem: {
		exec: function(options){
			
			if(options.character){
				options.say(`Já existe um personagem criado na sua conta! Para acessar o link do seu personagem, use o comando >personagem`);
			}
			else{
				let mod = options.context.mod || (options.context.badges && options.context.badges.broadcaster == "1");
				if(database.createNewCharacter(options.context["user-id"], false, mod, options.streamer)){
					options.say("Personagem de "+options.context["display-name"]+" criado com sucesso! Bem-vindo ao RPG do Gui Leocádio!");
					database.saveDatabase(options.streamer);
				}
				else{
					options.say("Ocorreu um erro ao criar seu personagem, tente de novo mais tarde");
				}
			}
		}
	},
	
	//Manda o link da pagina do personagem
	personagem: {
		character: true,
		exec: (options) => options.say(`Para ver os status do personagem de ${options.character.display_name}, acesse esse link: https://leocadios-rpg.herokuapp.com/personagem/?id=${options.character.twitch_id}&streamer=${options.streamer}`)
	},
	
	/* == COMANDOS INFORMATIVOS == */
	
	//Manda o link da loja
	loja: {
		exec: (options) => options.say("A loja pode ser acessada por esse link: https://leocadios-rpg.herokuapp.com/shop")
		
	},
	
	//Mensagens de tutorial
	tutorial: {
		exec: (options) => {
			options.say("Bem-vindo ao RPG das Lives do Leocádio! Para começar é simples, crie um personagem com o comando >criar_personagem");
			
			setTimeout(() => options.say("Depois de criar seu personagem, você pode lutar com os monstros do mundo usando o comando >lutar. Você também pode ver as informações de status e experiencia do seu personagem usando o comando >personagem"), 200);
			
			setTimeout(() => options.say("Você também pode lutar com o chefão do mundo usando o comando >boss, e caso queira novos desafios, use o comando >mundos"), 400);
		}
	},
	
	//Mostra o bonus atual
	bonus: {
		exec: (options) => {
			options.say("A live está atualmente com aproximadamente " + options.view_count + " espectadores! Isso dá um bonus de " + (options.view_count*100) + "% em todo o XP e moedas ganhos durante a live!");
		}
		
	},
	
	/* == COMANDOS DE INVENTÁRIO == */
	
	//Usa um item do inventário
	item: {
		character: true,
		not_combat: true,
		params: 1,
		exec: (o) => {
			if(o.character.inventory[o.tokens[1]]){
				if(items[o.tokens[1]].type == "consumable"){
					let sp = items.consume(o.character, o.tokens[1]);
					o.say((sp || o.character.display_name + " consome o item " + items[o.tokens[1]].display_name));
				}
				else o.say("O item " + items[o.tokens[1]].display_name + " não é consumível!");
			}
			else o.say("Não consegui encontrar o item " + o.tokens[1] + " no inventário de " + o.character.display_name);
		}
	},
	
	//Equipa um item do inventário
	equipar: {
		character: true,
		not_combat: true,
		params: 1,
		exec: (o) => {
			if(o.character.inventory[o.tokens[1]]){
				if(items[o.tokens[1]].type == "equipment"){
					items.equip(o.character, o.tokens[1]);
					o.say(o.character.display_name + " equipou o item " + items[o.tokens[1]].display_name);
				}
				else say("O item " + items[o.tokens[1]].display_name + " não é equipável!");				
			}
			else say("Não consegui encontrar o item " + o.tokens[1] + " no inventário de " + o.character.display_name);
		}
	},
	
	/* == COMANDOS DE COMBATE == */
	
	//Luta com um bixo random do mundo do seu nivel
	lutar: {
		character: true,
		exec: (options) => combat.engageCombatRandom(options.character, options.say, options.view_count)
	},
	
	//Luta contra o boss do mundo
	boss: {
		character: true,
		exec: (o) => combat.engageCombatWithBoss(o.character, say, o.view_count)
	},
	
	//Se tiver no meio de uma batalha, desiste dela
	correr: {
		character: true,
		exec: (o) => {
			combat.flee(o.character, client, channel);
		}
	},
	
	//Mostra o log de combate da ultima batalha
	log: {
		character: true,
		not_combat: true,
		exec: (o) => combat.printCombatLog(o.character, o.say)
	},
	
	/* == COMANDOS DE MUNDO == */
	
	//Mostra todos os mundos disponiveis
	mundos: {
		exec: (o) => {
			let speech = " == MUNDOS DISPONÍVEIS == ";
			for(i in Object.keys(worlds)){
				let key = Object.keys(worlds)[i];
				let w = worlds[key];
				if(w.display_name){
					speech += w.display_name + " [" + key + "]: Nivel " + w.level_range[0] + " até " + w.level_range[1] + " == ";
				}
			}
			speech += " == Para teleportar para um mundo, use o comando >mundo nome_do_mundo";
			o.say(speech);
		}
	},
	
	//Mostra o mundo atual, ou teleporta pra algum mundo
	mundo: {
		character: true,
		not_combat: true,
		exec: (o) => {
			if(o.tokens.length > 1){
				if(worlds[o.tokens[1]]){
					o.character.world = o.tokens[1];
					o.say("Bem-vindo à(o) " + worlds[o.character.world].display_name + ", " + o.character.display_name + "!");
				}
				else{
					o.say("Desculpe, não conheço esse mundo \"" + o.tokens[1] + "\" que você diz. Para ver a lista de todos os mundos, use o comando >mundos");
				}
			}
			else{
				say(o.character.display_name + " está atualmente no mundo " + worlds[o.character.world].display_name + " [" + o.character.world + "]. Para mudar de mundo, use o comando >mundo nome_do_mundo");
			}
		}
	},
	
	/* == COMANDOS DE COMPRA/VENDA == */
	
	//Compra um item da loja
	comprar: {
		character: true,
		not_combat: true,
		params: 1,
		exec: (o) => {
			let it = checkForItemInShop(o.tokens[1]);
			if(it){
				
				let qtd = o.tokens[2] || 1;
				qtd = Number(qtd);
					
				if(it.shop_price){
					if(o.character.coins >= it.shop_price * qtd){
						o.character.coins -= it.shop_price * qtd;
						o.character.giveItem(o.tokens[1], qtd);
						o.say(o.character.display_name + " acaba de comprar " + qtd + " " + it.display_name);
					}
					else o.say(o.character.display_name + " não tem moedas o suficiente para comprar " + it.display_name + " (o item custa "+(it.shop_price * qtd)+" moedas)");
				}
				else if(it.morc_price){
					if(o.character.morcs >= it.morc_price * qtd){
						o.character.morcs -= it.morc_price * qtd;
						o.character.giveItem(o.tokens[1], qtd);
						o.say(o.character.display_name + " acaba de comprar " + qtd + " " + it.display_name);
					}
					else o.say(o.character.display_name + " não tem Morcs o suficiente para comprar " + it.display_name + " (o item custa "+(it.morc_price * qtd)+" Morcs)");
				}
				else o.say("Por algum motivo, o item " + it.display_name + " não tem preço");
			}
			else o.say(o.character.display_name + " tentou comprar o item " + o.tokens[1] + ", mas não tem ninguém na loja vendendo esse item!");
		}
	},
	
	//Vender algum item do seu inventario
	vender: {
		character: true,
		params: 1,
		exec: (o) => {
			if(o.character.inventory[o.tokens[1]]){
				let qtd = o.tokens[2] || 1;
				qtd = Number(qtd);
					
				let it = items[o.tokens[1]];
				if(o.character.inventory[o.tokens[1]].stack >= qtd){
					if(it.shop_price){
						o.character.removeItem(o.tokens[1], qtd);
						let c = Math.floor(it.shop_price * 0.8);
						o.character.coins += c;
						o.say(o.character.display_name + " vende o item " + items[o.tokens[1]].display_name + " por " + c + " moedas");
					}
					else if(it.morc_price) o.say("Você não pode vender items de Morcs");
					else o.say("Por algum motivo, o item " + it.display_name + " não tem preço");
				}
				else o.say(o.character.display_name + " está tentando vender " + qtd + " " + it.display_name + ", mas ele só tem " + o.character.inventory[o.tokens[1]].stack + " no inventário!");
			}
			else o.say("Não consegui encontrar o item " + o.tokens[1] + " no inventário de " + o.character.display_name);
		}
	},
	
	/* == COMANDOS MEME == */
	
	shutdown:{
		"exec": function(options){
			options.say("Desligando...");
			setTimeout(() => say("KK trolei, to desligando nada"), 1000);
		}		
	},
	
};

module.exports = {
	"query": function(tokens, context, say, streamer, view_count){		
		let command = funcs[tokens[0]];
		let allCharacters = database.getAllCharacters(streamer);
		let character = allCharacters[context['user-id']];
		if(character) character.display_name = context["display-name"];

		if(command){
			if(command.character && !character){
				//Para usar este comando, vc precisa de um personagem
				say("Para usar este comando, "+context['display-name']+" precisa de um personagem! Para criar um personagem use o comando >criar_personagem");
			}
			else {
				if(perm(command, context)){
					if(tokens.length-1 >= (command.params || 0)){
						if(command.not_combat && combat.isPlayerInCombat(character)){
							say(character.display_name + " não pode usar esse comando durante um combate!");
						}
						else{
							command.exec({
								"tokens": tokens,
								"context": context,
								"say": say,
								"character": character,
								"allCharacters": allCharacters,
								"streamer": streamer,
								"view_count": view_count
							});
						}
					}
					else{
						//Número de parametros insuficiente
						say("O comando [" + tokens[0] + "] precisa de no mínimo " + (command.params || 0) + " parâmetros, mas você só passou " + (tokens.length-1));
					}
				}
				else{
					//Não tem permissão pra usar esse comando
				}
			}
		}
		else{
			//Comando não encontrado
			if(character.display_name.toLowerCase() == "titoncio"){
				say("tito da pra PARAR de tentar matar o meu bot???");
			}
			else{
				say("Comando ["+tokens[0]+"] não encontrado");
			}
		}
		
		
	}
}