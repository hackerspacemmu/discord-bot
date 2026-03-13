import { backendUrl, adminChannelId } from "config/env.js"
import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    TextChannel,
    MessageFlags,
} from "discord.js"
import { Meetup } from "types/meetup.js"
import { Update } from "types/update.js"

interface LastTalk {
    meetup: Meetup
    updates: Update[]
}

// In-memory cache for pending edit approvals (key: updateId_userId)
export const pendingTalkEdits = new Map<
    string,
    { updateId: number; userId: string; proposedText: string; currentDescription: string; discordTag: string }
>()

export const data = new SlashCommandBuilder()
    .setName("edit-my-last-talk")
    .setDescription("Request to edit your latest talk description (requires admin approval)")
    .addStringOption((option) =>
        option
            .setName("proposed_text")
            .setDescription("The new description you want for your last talk")
            .setRequired(true)
    )

export async function execute(interaction: ChatInputCommandInteraction) {
    const discordTag = interaction.user.tag
    const proposedText = interaction.options.getString("proposed_text", true)

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

        const data: LastTalk = await response.json()

        if (!data.meetup || data.updates.length === 0) {
            await interaction.editReply({
                content: `No talk data found for @${discordTag}.`,
            })
            return
        }

        const lastUpdate = data.updates[0]
        const cacheKey = `${lastUpdate.id}_${interaction.user.id}`
        pendingTalkEdits.set(cacheKey, {
            updateId: lastUpdate.id,
            userId: interaction.user.id,
            proposedText,
            currentDescription: lastUpdate.description,
            discordTag,
        })

        const embed = new EmbedBuilder()
            .setColor(0xffaa00) // Yellow/amber for pending
            .setTitle("Talk Edit Approval Request")
            .setDescription(`**Requested by:** ${interaction.user.tag} (${interaction.user.id})`)
            .addFields(
                {
                    name: "Current Description",
                    value: lastUpdate.description || "*No description*",
                    inline: false,
                },
                {
                    name: "Proposed Description",
                    value: proposedText,
                    inline: false,
                }
            )
            .setFooter({ text: `Update ID: ${lastUpdate.id}` })
            .setTimestamp()

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`approve_edit:${lastUpdate.id}:${interaction.user.id}`)
                .setLabel("Approve")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`reject_edit:${lastUpdate.id}:${interaction.user.id}`)
                .setLabel("Reject")
                .setStyle(ButtonStyle.Danger)
        )

        const adminChannel = interaction.client.channels.cache.get(adminChannelId) as TextChannel
        if (!adminChannel) {
            pendingTalkEdits.delete(cacheKey)
            await interaction.editReply({
                content: "Admin channel is not configured. Please contact a server administrator.",
            })
            return
        }

        await adminChannel.send({ embeds: [embed], components: [row] })

        await interaction.editReply({
            content: "Your edit request has been sent to the admins for approval. You will be notified via DM once a decision is made.",
        })
    } catch (error: any) {
        console.error("Error requesting talk edit:", error)

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({
                content: "There was an error while processing your request. Please try again later.",
            })
            return
        }

        await interaction.reply({
            content: "There was an error while processing your request. Please try again later.",
            flags: MessageFlags.Ephemeral,
        })
    }
}
