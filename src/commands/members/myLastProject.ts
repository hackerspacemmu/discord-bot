import { backendUrl } from "config/env.js"
import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js"
import { Project } from "types/project.js"
import { dateMod } from "utils/ModifyDate.js"

export const data = new SlashCommandBuilder()
    .setName("show-last-project")
    .setDescription("Get your latest project created!")
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
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const response = await fetch(
            `${backendUrl}/api/v1/discord/fetch-last-project?discord_tag=${encodeURIComponent(discordTag)}`
        )

        if (!response.ok) {
            await interaction.editReply({
                content: `Could not find any projects for @${discordTag}.`,
            })
            return
        }

        const responseData = await response.json()
        const project: Project = responseData.project

        if (!project) {
            await interaction.editReply({
                content: `No project data found for @${discordTag}.`,
            })
            return
        }

        await interaction.editReply(
            `\n\n__**${project.name}**__\n**Category**: ${project.category}\n**Completed**: ${project.completed ? "Yes" : "No"}\n**Created At**: ${dateMod(project.created_at)}`
        )

    } catch(error: any) {
        console.error('Error fetching latest project:', error)

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({
                content: 'There was an error while fetching your latest project. Please try again later.',
            })
            return
        }

        await interaction.reply({
            content: 'There was an error while fetching your latest project. Please try again later.',
            flags: MessageFlags.Ephemeral,
        })
    }
}

