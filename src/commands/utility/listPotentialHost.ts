import { backendUrl } from "config/env.js";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

interface PotentialHost {
    "potential_hosts": {
        "Have Hosted": string[]
        "Yet To Host": string[]
    }
}

export const data = new SlashCommandBuilder()
    .setName("list-potential-hosts")
    .setDescription("List potential hosts for upcoming meetups!")

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        await interaction.deferReply(); // Buys you 15 minutes instead of 3 seconds

        const response = await fetch(
            `${backendUrl}/api/v1/discord/get-potential-hosts-for-meetup`
        );

        const data: PotentialHost = await response.json();

        if (!response.ok || !data) {
            await interaction.editReply({
                content: `Could not find any potential hosts for upcoming meetups.`
            });
            return;
        }

        const potentialHosts = data.potential_hosts;

        await interaction.editReply({
            content: 
            `**Potential Hosts for Upcoming Meetups:**\n` +
            (potentialHosts["Have Hosted"].length === 0 
                ? "No potential hosts found." 
                : potentialHosts["Have Hosted"].map((host, index) => 
                    `${index + 1}. ${host}`
                ).join('\n'))
            + `\n\n**Members Who Have Not Hosted Yet:**\n` +
            (potentialHosts["Yet To Host"].length === 0 
                ? "No members found." 
                : potentialHosts["Yet To Host"].map((host, index) => 
                    `${index + 1}. ${host}`
                ).join('\n'))
        });

    } catch (error) {
        console.error('Error fetching potential hosts:', error);

        // Use editReply here too, since we already deferred
        await interaction.editReply({
            content: 'There was an error while fetching potential hosts. Please try again later.',
        });
    }
}