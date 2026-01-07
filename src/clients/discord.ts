import { 
    Client, 
    Collection,
    Events, 
    GatewayIntentBits,
} from 'discord.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { discordBotToken } from '../config/env.js'
import { checkNewMemberEntry } from 'commands/utility/checkNewMemberEntry.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ] 
})

client.commands = new Collection()

async function loadCommands() {
    const foldersPath = path.join(__dirname, '..', 'commands')
    const commandFolders = fs.readdirSync(foldersPath)

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder)
        const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.ts'))
        
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file)
            const command = await import(filePath)

            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command)
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
            }
        }
    }
}

function setupEventHandlers() {
    client.once(Events.ClientReady, (readyClient) => {
        console.log(`Ready! Logged in as ${readyClient.user.tag}`)
    })

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return
        const command = client.commands.get(interaction.commandName)

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`)
            return
        }

        try {
            await command.execute(interaction)
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`)
            await interaction.reply({ 
                content: 'There was an error while executing this command!', 
                ephemeral: true 
            })
        }
    })

    client.on(Events.GuildMemberAdd, async (member) => {
        await checkNewMemberEntry(member)
    })
}

export async function startDiscordBot() {
    await loadCommands()
    setupEventHandlers()
    await client.login(discordBotToken)
}

