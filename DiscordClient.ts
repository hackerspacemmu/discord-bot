import { Client, Events, GatewayIntentBits } from 'discord.js'
import { discordBotToken } from '../env'

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Discord Client Ready! Logged in as ${readyClient.user.tag}`)
})

client.login(discordBotToken)
