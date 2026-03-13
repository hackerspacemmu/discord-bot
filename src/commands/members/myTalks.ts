import { backendUrl } from "config/env.js";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Update } from "types/update.js";

export const data = new SlashCommandBuilder()
    .setName("show-talks")
    .setDescription("Get your member talks!")
    .addIntegerOption(option =>
        option
            .setName("talks")
            .setDescription("Choose from 1 to 10 talks to display")
            .setMinValue(1)
            .setMaxValue(10)
            .setRequired(true)
    )
    .addUserOption(option =>
        option
            .setName("member")
            .setDescription("The member to look up (optional, defaults to yourself)")
            .setRequired(false)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const numberOfTalks = interaction.options.getInteger("talks", true);
    const targetUser = interaction.options.getUser("member");
    const discordTag = targetUser?.tag ?? interaction.user.tag;

    try {
        await interaction.deferReply()

        const response = await fetch(
            `${backendUrl}/api/v1/discord/fetch-member-talks?discord_tag=${encodeURIComponent(discordTag)}&limit=${numberOfTalks}`
        )

        const data: Update[] = (await response.json()).updates;

        if (!response.ok || !data) {
            await interaction.editReply({
                content: `Could not find talks for @${discordTag}. Are you sure they are part of hackerspace?`
            });
            return;
        }

        await interaction.editReply({
            content: 
            `**${discordTag}'s recent talks:**\n` + data.map(update => `- [${update.project ? update.project.name : 'Unknown Project'}] ${update.description} (on ${new Date(update.created_at).toLocaleDateString()})`).join('\n'),
        })

    } catch(error: any) {
        console.error('Error fetching member talks:', error)

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({
                content: 'There was an error while fetching your member talks. Please try again later.',
            })
            return
        }

        await interaction.reply({
            content: 'There was an error while fetching your member talks. Please try again later.',
        })
    }
}