import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
} from "discord.js";
import { MeetupCommand } from "types/meetupv2.js";

const UPDATES_PER_PAGE = 5;

function buildEmbed(data: MeetupCommand, title: string, page: number, totalPages: number): EmbedBuilder {
    const start = page * UPDATES_PER_PAGE;
    const pageUpdates = data.updates.slice(start, start + UPDATES_PER_PAGE);

    const updatesText = pageUpdates
        .map((update, i) =>
            `${start + i + 1}. [${update.category}] ${update.description.replace(/\s+/g, ' ').trim()} (by ${update.member?.name ?? 'Unknown'})`
        )
        .join('\n');

    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(
            `• Date: ${data.date}\n` +
            `• Number: ${data.category === 'hackathon' ? data.hackathon_number : data.number}\n` +
            `• Category: ${data.category}\n` +
            `• Host: ${data.host?.name ?? 'Unknown'}\n` +
            `• Total Updates: ${data.updates.length}\n\n` +
            `**Updates (Page ${page + 1}/${totalPages}):**\n` +
            (updatesText || 'No updates.')
        );
}

function buildButtons(page: number, totalPages: number, disabled = false): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled || page === 0),
        new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled || page === totalPages - 1),
    );
}

export async function paginateMeetupUpdates(
    interaction: ChatInputCommandInteraction,
    data: MeetupCommand,
    title: string,
) {
    const totalPages = Math.max(1, Math.ceil(data.updates.length / UPDATES_PER_PAGE));
    let page = 0;

    const message = await interaction.editReply({
        embeds: [buildEmbed(data, title, page, totalPages)],
        components: totalPages > 1 ? [buildButtons(page, totalPages)] : [],
    });

    if (totalPages <= 1) return;

    const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 90_000,
    });

    collector.on('collect', async (btn) => {
        if (btn.customId === 'prev') page = Math.max(0, page - 1);
        if (btn.customId === 'next') page = Math.min(totalPages - 1, page + 1);

        await btn.update({
            embeds: [buildEmbed(data, title, page, totalPages)],
            components: [buildButtons(page, totalPages)],
        });
    });

    collector.on('end', () => {
        interaction.editReply({ components: [buildButtons(page, totalPages, true)] }).catch(() => {});
    });
}
