import { backendUrl } from "config/env.js";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { MeetupCommand } from "types/meetupv2.js";

export const data = new SlashCommandBuilder()
    .setName("meetup")
    .setDescription("Get a specific meetup's information!")
    .addIntegerOption(option =>
        option.setName('number')
            .setDescription('The number of the meetup')
            .setRequired(true)
    )
	.addStringOption((option) =>
		option
			.setName('category')
			.setDescription('The meetup category')
			.setRequired(true)
			.addChoices(
				{ name: 'Regular Meetup', value: '0' },
				{ name: 'Hackathon', value: '1' },
			),
	);

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        const meetupNumber = interaction.options.getInteger('number');
        const category = interaction.options.getString('category')

        if (category !== '0' && category !== '1') {
            await interaction.reply({
                content: `Invalid category provided. Please choose either Regular Meetup or Hackathon.`,
            });
            return;
        }

        const response = await fetch(
            `${backendUrl}/api/v1/discord/fetch-meetup?category=${category}&meetup_number=${meetupNumber}`
        )

        const data: MeetupCommand = (await response.json()).meetup;

        if (!response.ok || !data) {
            await interaction.reply({
                content: `Could not find statistics for meetup number ${meetupNumber}. Are you sure it exists?`,
            });
            return;
        }

        await interaction.reply({
            content: 
            `__**Meetup Number ${meetupNumber} Information**__\n` +
            `• Date: ${data.date}\n` +
            `• Number: ${data.category === 'hackathon' ? data.hackathon_number : data.number}\n` +
            `• Category: ${data.category}\n` +
            `• Host: ${data.host.name}\n` +
            `• Number of Updates: ${data.updates.length}\n` +
            `\n**Updates:**\n` +
            data.updates.map((update, index) => 
                `${index + 1}. [${update.category}] ${update.description} (by ${update.member ? update.member.name : 'Unknown'})`
            ).join('\n')
        })

    } catch(error: any) {
        console.error('Error fetching meetup number stats:', error)
        
        await interaction.reply({
            content: `There was an error while fetching the statistics for the given meetup number. Please try again later.`,
        })
    }
}