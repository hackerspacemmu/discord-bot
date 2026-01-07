import { client } from '../../clients/discord.js'
import { testChannelId } from '../../config/env.js'
import { TextChannel } from 'discord.js'

export async function execute(tagName: string) {
    console.log('Sending hi to Discord channel')
    const channel = client.channels.cache.get(testChannelId) as TextChannel
    
    if (!channel) {
        throw new Error('Channel not found')
    }

    await channel.send('Fuck off ' + tagName)
}

