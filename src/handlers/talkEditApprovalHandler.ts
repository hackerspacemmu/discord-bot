import { backendUrl, adminRoleId } from "config/env.js"
import {
    ButtonInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
} from "discord.js"
import { pendingTalkEdits } from "../commands/members/editMyLastTalk.js"

export async function handleTalkEditApprovalButton(interaction: ButtonInteraction) {
    const customId = interaction.customId
    if (!customId.startsWith("approve_edit:") && !customId.startsWith("reject_edit:")) {
        return false
    }

    // Permission guard: only users with Admin role can click
    const member = interaction.member
    if (!member || !("roles" in member)) {
        await interaction.reply({ content: "Unable to verify permissions.", ephemeral: true })
        return true
    }

    const hasAdminRole =
        "cache" in member.roles
            ? member.roles.cache.has(adminRoleId)
            : (member.roles as string[]).includes(adminRoleId)
    const permissions = member.permissions as { has?: (flag: bigint) => boolean } | undefined
    const isGuildAdmin = permissions?.has?.(PermissionFlagsBits.Administrator) ?? false

    if (!hasAdminRole && !isGuildAdmin) {
        await interaction.reply({
            content: "You don't have permission to perform this action.",
            ephemeral: true,
        })
        return true
    }

    const [, updateIdStr, userId] = customId.split(":")
    const cacheKey = `${updateIdStr}_${userId}`
    const pending = pendingTalkEdits.get(cacheKey)

    if (!pending) {
        await interaction.reply({
            content: "This approval request has expired or already been processed.",
            ephemeral: true,
        })
        return true
    }

    const isApproved = customId.startsWith("approve_edit:")

    if (isApproved) {
        try {
            const updateResponse = await fetch(
                `${backendUrl}/api/v1/discord/update-member-talk/${pending.updateId}?discordTag=${pending.discordTag}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ description: pending.proposedText }),
                }
            )

            if (!updateResponse.ok) {
                throw new Error("API update failed")
            }
        } catch (error) {
            console.error("Error updating talk via API:", error)
            await interaction.reply({
                content: "Failed to update the talk. Please try again later.",
                ephemeral: true,
            })
            return true
        }
    }

    pendingTalkEdits.delete(cacheKey)

    const updatedEmbed = new EmbedBuilder()
        .setColor(isApproved ? 0x00ff00 : 0xff0000) // Green or Red
        .setTitle(isApproved ? "Talk Edit Approved" : "Talk Edit Rejected")
        .setDescription(
            `**Requested by:** <@${pending.userId}>\n**Status:** ${isApproved ? "Approved" : "Rejected"}`
        )
        .addFields(
            {
                name: "Current Description",
                value: pending.currentDescription || "*No description*",
                inline: false,
            },
            {
                name: "Proposed Description",
                value: pending.proposedText,
                inline: false,
            }
        )
        .setFooter({ text: `Update ID: ${pending.updateId}` })
        .setTimestamp()

    await interaction.update({
        embeds: [updatedEmbed],
        components: [], // Remove buttons
    })

    // DM the original user
    try {
        const user = await interaction.client.users.fetch(pending.userId)
        await user.send(
            isApproved
                ? `Your talk edit request has been **approved**. Your description has been updated.`
                : `Your talk edit request has been **rejected**. No changes were made.`
        )
    } catch (dmError) {
        console.error("Could not DM user:", dmError)
    }

    return true
}
