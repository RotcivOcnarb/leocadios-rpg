const tmi = require('tmi.js');

// Define configuration options
const opts = {
  identity: {
	username: "RotsBots",
	password: "oauth:o8ut98dsvn59t5hqynkhlm6o4x8yz6"
  },
  channels: [ "RotcivOcnarb" ]
};

// Create a client with our options
client = new tmi.client(opts);
client.on('message', (channel, context, message, self) => {
	if(self) return;
	
	client.say(channel, "Opa, escutei uma mensagem do " + context['display-name']);
	client.whisper(context['display-name'], "Recebi sua mensagem: " + message);
	
	
});

client.on('whisper', (from, context, messagem, self) => {
	
	
	
});

client.connect();
