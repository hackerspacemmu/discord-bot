const { Client, Events, GatewayIntentBits } = require('discord.js')
import { discordBotToken } from './env'

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient: any) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(discordBotToken);
