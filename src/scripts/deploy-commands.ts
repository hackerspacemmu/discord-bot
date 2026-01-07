import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { REST, Routes } from 'discord.js'
import { discordBotToken, discordBotClientId, discordServerId } from '../config/env.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const commands: any[] = []
const foldersPath = path.join(__dirname, '..', 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder)
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.ts'))

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)
        const command = await import(filePath)
        
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON())
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
        }
    }
}

const rest = new REST().setToken(discordBotToken);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`)
        
        const data = await rest.put(
            Routes.applicationGuildCommands(discordBotClientId, discordServerId),
            { body: commands },
        )
        console.log(`Successfully reloaded ${(data as any[]).length} application (/) commands.`)
    } catch (error) {
        console.error(error)
    }
})()

