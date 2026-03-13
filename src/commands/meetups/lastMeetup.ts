import { backendUrl } from "config/env.js";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { MeetupCommand } from "types/meetupv2.js";

export const data = new SlashCommandBuilder()
    .setName("show-last-meetup")
    .setDescription("Get the last meetup's information!")

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        await interaction.deferReply()

        const response = await fetch(
            `${backendUrl}/api/v1/discord/fetch-last-meetup`
        )

        const data: MeetupCommand = (await response.json()).meetup;

        if (!response.ok || !data) {
            await interaction.editReply({
                content: `Could not find statistics for the last meetup.`
            });
            return;
        }

        await interaction.editReply({
            content: 
            `__**Last Meetup Information**__\n` +
            `• Date: ${data.date}\n` +
            `• Number: ${data.number}\n` +
            `• Category: ${data.category}\n` +
            `• Host: ${data.host.name}\n` +
            `• Number of Updates: ${data.updates.length}\n` +
            `\n**Updates:**\n` +
            data.updates.map((update, index) => 
                `${index + 1}. [${update.category}] ${update.description} (by ${update.member ? update.member.name : 'Unknown'})`
            ).join('\n')
        })

    } catch(error: any) {
        console.error('Error fetching last meetup stats:', error)

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({
                content: 'There was an error while fetching the last meetup statistics. Please try again later.',
            })
            return
        }

        await interaction.reply({
            content: 'There was an error while fetching the last meetup statistics. Please try again later.',
        })
    }
}