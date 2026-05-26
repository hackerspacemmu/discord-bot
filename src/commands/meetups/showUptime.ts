import { backendUrl } from "config/env.js";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { MeetupCommand } from "types/meetupv2.js";
import { Stats } from "types/stats.js";

export const data = new SlashCommandBuilder()
    .setName("show-uptime")
    .setDescription("get the uptime since the first meetup!")

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        await interaction.deferReply()

        const response = await fetch(
            `${backendUrl}/api/v1/discord/fetch-days-since-first-meetup`
        )

        const data = (await response.json());

        if (!response.ok || !data) {
            await interaction.editReply({
                content: `Could not find uptime information since the first meetup.`
            });
            return;
        }

        await interaction.editReply({
            content: `**${data.days_since}** days since our first meetup`
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