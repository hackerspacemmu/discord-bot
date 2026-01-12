import { backendUrl } from "config/env.js"
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js"
import { Project } from "types/project.js"
import { dateMod } from "utils/ModifyDate.js"

export const data = new SlashCommandBuilder()
    .setName("my-last-project")
    .setDescription("Get your latest project created!")

export async function execute(interaction: ChatInputCommandInteraction) {
    const discordTag = interaction.user.tag
    
    try {
        const response = await fetch(
            `${backendUrl}/api/v1/discord/fetch-last-project?discord_tag=${encodeURIComponent(discordTag)}`
        )

        if (!response.ok) {
            await interaction.reply({
                content: `Could not find any projects for @${discordTag}.`,
                ephemeral: true
            })
            return
        }

        const responseData = await response.json()
        const project: Project = responseData.project

        if (!project) {
            await interaction.reply({
                content: `No project data found for @${discordTag}.`,
                ephemeral: true
            })
            return
        }

        await interaction.reply(
            `\n\n__**${project.name}**__\n**Category**: ${project.category}\n**Completed**: ${project.completed ? "Yes" : "No"}\n**Created At**: ${dateMod(project.created_at)}`
        )

    } catch(error: any) {
        console.error('Error fetching latest project:', error)
        await interaction.reply({
            content: 'There was an error while fetching your latest project. Please try again later.',
            ephemeral: true
        })
    }
}

