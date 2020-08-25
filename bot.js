const tmi = require('tmi.js');
const database = require("./database");
const Character = require("./character");
const combat = require("./combat");
const twitch = require("./twitch_api");
const worlds = require("./data/worlds.json");
const items = require("./items");
const shop = require("./data/shop.json");
const seedrandom = require("seedrandom");
const commands = require("./commands");
const dropbox = require("./drive_api");
const rewards = require("./rewards");

function init(environment, streamer){
	
	const options = {
		"display_names": {},
		"view_count": 0,
		"lastActivity": {},
	}
	
	// Define configuration options
	const opts = {
	  identity: {
		username: "RotsBots",
		password: "oauth:o8ut98dsvn59t5hqynkhlm6o4x8yz6"
	  },
	  channels: [ streamer ]
	};

	// Create a client with our options
	client = new tmi.client(opts);
	options.client = client;
	client.say_2 = client.say;
	client.say = function(channel, message){
		console.log("-> " + message + "\n--");
		client.say_2(channel, message);
	}

	// Register our event handlers (defined below)
	client.on('message', (ch, co, m, s) => onMessageHandler(ch, co, m, s, environment, streamer, options));
	client.on('connected', onConnectedHandler);
	client.on('cheer', (ch, co, m) => onCheerHandler(ch, co, m, environment, streamer));

	database.loadDatabase(environment, streamer);

	// Connect to Twitch:
	client.connect();

	setInterval(() => database.saveDatabase(environment, streamer), 1000 * 30); //Salva os dados a cada 30 segundos
	setInterval(() => {	//Atualiza a contagem de views a cada 20 segundos
		twitch.getLiveViewCount((count) => {
			options.view_count = count;
		}, streamer);
	}, 20 * 1000);

	/* AVISO PRA DAR AOS VIEWERS

	Alguns sistemas automaticos requerem que o usuário esteja ativo na live, por isso, se você ficar sem comentar nada por mais de 5 minutos, mesmo que esteja vendo a live, o sistema vai identificar que você está OFFLINE, e não vai te dar alguns bonus:

	- Recuperação de vida

	*/

	setInterval( () => {
		//Aumenta a vida de todo mundo a cada 10 segundos se ele não estiver em combate, e ele estiver na live
		let allCharacters = database.getAllCharacters(environment, streamer);
		
		for(var i in Object.keys(allCharacters)){
			var k = Object.keys(allCharacters)[i];
			var ch = allCharacters[k];
			
			if(!combat.isPlayerInCombat(ch)){
				if(options.lastActivity[ch.twitch_id] && (Date.now() - options.lastActivity[ch.twitch_id]) < 1000 * 60 * 5){
					ch.health += (0.1 * ch.getAttribute("max_health"));
					ch.health = Math.min(Math.floor(ch.health), ch.getAttribute("max_health"));
				}
			}
		}
		
	}, 30 * 1000);

}

// Called every time a message comes in
async function onMessageHandler (channel, context, msg, self, environment, streamer, options) {
	if(self && msg == ">botid") console.log(JSON.stringify(context, null, 2));
	if (self) { return; } // Ignore messages from the bot
  	options.display_names[context["user-id"]] = context['display-name'];
	options.lastActivity[context["user-id"]] = Date.now();
	if(msg == ">context") console.log(JSON.stringify(context, null, 2));
	
	if(msg.startsWith(">"))
		commands.query(
			msg.substring(1, msg.length).split(" "),
			context,
			(msg) => client.say(channel, msg),
			environment,
			streamer,
			options.view_count);
	
  
	if(context["custom-reward-id"])
		rewards.query(context["custom-reward-id"], (msg) => client.say(channel, msg), context, environment, streamer);
	
}


function onCheerHandler(channel, context, message){
	
	let character = database.retrieveCharacterData(context["user-id"], environment, streamer);
	options.lastActivity[context["user-id"]] = Date.now();

	if(character){
		character.morcs += context.bits;
		client.say(channel, character.display_name + " acaba de receber " + bits + " Morcs por ter doado bits pro canal!!! Obrigado!");
	}
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

module.exports = init;