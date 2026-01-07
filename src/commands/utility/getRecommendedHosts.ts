import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('get-recommended-hosts')
    .setDescription('Provides a list of recommended hosting providers')

export async function execute(interaction: any) {
    const response = await fetch('http://localhost:3000/api/v1/discord/recommended-hosts')
    const hosts = await response.json()

    let replyMessage = '**Recommended Hosts:**\n\n'
    for (const [category, hostList] of Object.entries(hosts.hosts) as [string, [string, number][]][]) {
        replyMessage += `__${category}__\n`
        if (hostList.length === 0) {
            replyMessage += 'No hosts available.\n\n'
            continue
        }
        for (const [hostName] of hostList) {
            replyMessage += `- ${hostName}\n`
        }
        replyMessage += '\n'
    }
    await interaction.reply(replyMessage)
}