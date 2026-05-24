import { backendUrl } from "config/env.js";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Stats } from "types/stats.js";

export const data = new SlashCommandBuilder()
    .setName("show-stats")
    .setDescription("Get your member statistics!")
    .addUserOption(option =>
        option
            .setName("member")
            .setDescription("The member to look up (optional, defaults to yourself)")
            .setRequired(false)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser("member");
    const discordTag = targetUser?.tag ?? interaction.user.tag;

    try {
        await interaction.deferReply()

        const response = await fetch(
            `${backendUrl}/api/v1/discord/fetch-member-stats?discord_tag=${encodeURIComponent(discordTag)}`
        )

        const data: Stats = await response.json();

        if (!response.ok || !data) {
            await interaction.editReply({
                content: `Could not find statistics for @${discordTag}. Are you sure you are part of hackerspace?`
            });
            return;
        }

        await interaction.editReply({
            content: 
            `**${data.stats.name}'s stats**\nTotal Projects: ${data.stats.total_projects}\nCompleted Projects: ${data.stats.completed_projects}\nTotal Updates: ${data.stats.total_updates}`,
        })

    } catch(error: any) {
        console.error('Error fetching member stats:', error)

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({
                content: 'There was an error while fetching your member statistics. Please try again later.',
            })
            return
        }

        await interaction.reply({
            content: 'There was an error while fetching your member statistics. Please try again later.',
        })
    }
}