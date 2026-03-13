import { backendUrl } from "config/env.js";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Meetup } from "types/meetup.js";
import { isCorrectDateFormat } from "utils/CheckDateFormat.js";
import { convertDateToReadableDate } from "utils/ConvertDatetoReadableDate.js";

export interface SearchMeetupByDateResponse {
    meetups_before_date: Meetup[]
    meetups_after_date: Meetup[]
}

export const data = new SlashCommandBuilder()
    .setName("search-meetup-by-date")
    .setDescription("Search for a meetup by its date! It returns the 3 most recent meetups before and after that date.")
    .addStringOption(option =>
        option.setName('date')
            .setDescription('The date of the meetup in YYYY-MM-DD format')
            .setRequired(true)
    )

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        await interaction.deferReply()

        const date = interaction.options.getString('date');

        if(!isCorrectDateFormat(date)) {
            await interaction.editReply({
                content: `Invalid date format. Please provide the date in YYYY-MM-DD format.`,
            });
            return;
        }

        const response = await fetch(
            `${backendUrl}/api/v1/discord/fetch-meetups-by-date?date=${date}`
        )

        const data: SearchMeetupByDateResponse = (await response.json());

        if (!response.ok || !data) {
            await interaction.editReply({
                content: `Could not find any meetups around the date ${convertDateToReadableDate(date!!)}.`,
            });
            return;
        }

        await interaction.editReply({
            content: 
            `__**Meetups Around ${convertDateToReadableDate(date!!)}**__\n` +

            // reverse the iteration mapping for before meetups
            `\n**Meetups Before:**\n` +
            (data.meetups_before_date.length === 0 ? "No meetups found before this date." :
            data.meetups_before_date.slice().reverse().map((meetup, index) => 
                `${index + 1}. [${meetup.category}] Meetup Number: ${meetup.category === 'hackathon' ? meetup.hackathon_number : meetup.number}, Date: ${convertDateToReadableDate(meetup.date)}`
            ).join('\n')) +

            `\n\n**Meetups After:**\n` +
            (data.meetups_after_date.length === 0 ? "No meetups found after this date." :
            data.meetups_after_date.map((meetup, index) => 
                `${index + 1}. [${meetup.category}] Meetup Number: ${meetup.category === 'hackathon' ? meetup.hackathon_number : meetup.number}, Date: ${convertDateToReadableDate(meetup.date)}`
            ).join('\n'))   
        })

    } catch(error: any) {
        console.error('Error fetching meetups by date:', error)

        await interaction.editReply({
            content: `There was an error while fetching the meetups around the given date. Please try again later.`,
        })
    }
}