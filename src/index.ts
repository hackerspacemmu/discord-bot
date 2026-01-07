import { startDiscordBot } from './clients/discord.js'
import { startExpressServer } from './clients/express.js'

async function main() {
    try {
        startExpressServer()
        startDiscordBot()
    } catch (error) {
        console.error('Failed to start application:', error)
        process.exit(1)
    }
}

main()

