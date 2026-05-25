import { backendUrl } from "config/env.js";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { MeetupCommand } from "types/meetupv2.js";
import { paginateMeetupUpdates } from "utils/paginateMeetupUpdates.js";

export const data = new SlashCommandBuilder()
    .setName("show-meetup")
    .setDescription("Get a specific meetup's information!")
    .addIntegerOption(option =>
        option.setName('number')
            .setDescription('The number of the meetup (pass a number from 1 to 10 to show more meetups)')
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
        await interaction.deferReply()

        const meetupNumber = interaction.options.getInteger('number');
        const category = interaction.options.getString('category')

        if (category !== '0' && category !== '1') {
            await interaction.editReply({
                content: `Invalid category provided. Please choose either Regular Meetup or Hackathon.`,
            });
            return;
        }

        const response = await fetch(
            `${backendUrl}/api/v1/discord/fetch-meetup?category=${category}&meetup_number=${meetupNumber}`
        )

        const data: MeetupCommand = (await response.json()).meetup;

        if (!response.ok || !data) {
            await interaction.editReply({
                content: `Could not find statistics for meetup number ${meetupNumber}. Are you sure it exists?`,
            });
            return;
        }

        await paginateMeetupUpdates(interaction, data, `Meetup Number ${meetupNumber} Information`);

    } catch(error: any) {
        console.error('Error fetching meetup number stats:', error)

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({
                content: `There was an error while fetching the statistics for the given meetup number. Please try again later.`,
            })
            return
        }

        await interaction.reply({
            content: `There was an error while fetching the statistics for the given meetup number. Please try again later.`,
        })
    }
}