const tmi = require('tmi.js');

const opts = {
	  identity: {
		username: "RotsBots",
		password: "oauth:o8ut98dsvn59t5hqynkhlm6o4x8yz6"
	  },
	  connection: { random: 'group' }
	};

// Create a client with our options
let client = new tmi.client(opts);

let environment = (process.env.NODE_ENV || "development");

// Register our event handlers (defined below)
client.on('connected', onConnectedHandler);
client.on('whisper', onWhisperHandler);

function onWhisperHandler(channel, user, message, self){
	if(self) return;
	
	switch(user['message-type']) {
        case 'chat':
        case 'action':
            console.log(user['message-type'], 'from', user['display-name'], 'in', channel, 'saying "' + message + '"');
            break;

        case 'whisper':
            console.log('whisper from', user['display-name'], 'saying "' + message + '"');
			client.whisper(user['display-name'], "Recebi sua mensagem!");
            break;
    }
}

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

client.connect();

