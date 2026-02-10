import { backendUrl } from "config/env.js"
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js"
import { Meetup } from "types/meetup.js"
import { Update } from "types/update.js"
import { dateMod } from "utils/ModifyDate.js"

interface LastTalk {
    meetup: Meetup,
    updates: Update[]
}

export const data = new SlashCommandBuilder()
    .setName("my-last-talk")
    .setDescription("Get your latest talk given!")
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
        const response = await fetch(
            `${backendUrl}/api/v1/discord/fetch-last-update?discord_tag=${encodeURIComponent(discordTag)}`
        )

        if (!response.ok) {
            await interaction.reply({
                content: `Could not find any talks for @${discordTag}.`,
                ephemeral: true
            })
            return
        }

        const data:LastTalk = await response.json()

        if (!data.meetup || data.updates.length === 0) {
            await interaction.reply({
                content: `No talk data found for @${discordTag}.`,
                ephemeral: true
            })
            return
        }

        data.updates.map(async (update: Update) => {
            await interaction.reply(
                `\n\n__**${update.project?.name}**__\n**Category**: ${update.project?.category}\n**Completed**: ${update.project?.completed ? "Yes" : "No"}\n**Created At**: ${dateMod(update.created_at)}\n\nTalk Given At Meetup **#${data.meetup.number}** on **${dateMod(data.meetup.date)}** \n\n**Description**: ${update.description}`
            )
        })

    } catch(error: any) {
        console.error('Error fetching latest project:', error)
        await interaction.reply({
            content: 'There was an error while fetching your latest project. Please try again later.',
            ephemeral: true
        })
    }
}

