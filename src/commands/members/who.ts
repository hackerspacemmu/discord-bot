import { backendUrl } from "config/env.js";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("who")
    .setDescription("Find out who this person is!")
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
            `${backendUrl}/api/v1/discord/fetch-member-name?discord_tag=${encodeURIComponent(discordTag)}`
        )

        const data = await response.json();

        if (!response.ok || !data) {
            await interaction.editReply({
                content: `Could not find name for @${discordTag}. Are you sure they are part of hackerspace?`
            });
            return;
        }

        await interaction.editReply({
            content: 
            `**${data.name}** is @${discordTag} in Discord.`,
        })

    } catch(error: any) {
        console.error('Error fetching member stats:', error)

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({
                content: 'There was an error while fetching the member information. Please try again later.',
            })
            return
        }

        await interaction.reply({
            content: 'There was an error while fetching the member information. Please try again later.',
        })
    }
}