import { EmbedBuilder, SlashCommandBuilder } from "discord.js"

export const data = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Replies with a list of commands!")

export async function execute(interaction: any) {
    await interaction.deferReply()

    // create embed with title "Help" and description "Here is a list of commands:"
    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Command List")
        .setDescription("Here is a list of commands:")
        .addFields(
            { name: "/help", value: "Replies with a list of commands!" },
            { name: "/edit-my-last-talk", value: "Edits the description of your last talk." },
            { name: "/show-last-talk", value: "Shows the description of your last talk." },
            { name: "/show-last-project", value: "Shows the description of your last project." },
            { name: "/show-talks", value: "Shows a list of your talks (pass a number from 1 to 10 to show more talks)" },
            { name: "/show-stats", value: "Shows a member's statistics." },
            { name: "/who", value: "Shows a member's name." },
            { name: "/show-last-meetup", value: "Shows the information of the last meetup." },
            { name: "/show-meetup", value: "Shows the information of a specific meetup (pass a number from 1 to 10 to show more meetups)" },
            { name: "/show-uptime", value: "Shows the uptime since the first meetup." },
            { name: "/search-meetup-by-date", value: "Search for a meetup by its date! It returns the 3 most recent meetups before and after that date." },
            { name: "/list-potential-hosts", value: "Shows a list of potential hosts for the next meetup." },
        )
    await interaction.editReply({ embeds: [embed] })
}
