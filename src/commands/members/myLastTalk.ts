import { backendUrl } from "config/env.js"
import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js"
import { Meetup } from "types/meetup.js"
import { Update } from "types/update.js"
import { dateMod } from "utils/ModifyDate.js"

interface LastTalk {
    meetup: Meetup,
    updates: Update[]
}

export const data = new SlashCommandBuilder()
    .setName("show-last-talk")
    .setDescription("Shows the description of your last talk!")
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
            `${backendUrl}/api/v1/discord/fetch-last-update?discord_tag=${encodeURIComponent(discordTag)}`
        )

        if (!response.ok) {
            await interaction.editReply({
                content: `Could not find any talks for @${discordTag}.`,
            })
            return
        }

        const data:LastTalk = await response.json()

        if (!data.meetup || data.updates.length === 0) {
            await interaction.editReply({
                content: `No talk data found for @${discordTag}.`,
            })
            return
        }

        const talkDetails = data.updates
            .map(
                (update: Update) =>
                    `\n\n__**${update.project?.name}**__\n**Category**: ${update.project?.category}\n**Completed**: ${update.project?.completed ? "Yes" : "No"}\n**Created At**: ${dateMod(update.created_at)}\n\nTalk Given At Meetup **#${data.meetup.number}** on **${dateMod(data.meetup.date)}** \n\n**Description**: ${update.description}`
            )
            .join('\n')

        await interaction.editReply(talkDetails)

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

