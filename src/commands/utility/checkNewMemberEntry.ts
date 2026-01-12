import { backendUrl } from 'config/env.js'
import { GuildMember } from 'discord.js'

export async function checkNewMemberEntry(member: GuildMember) {
    console.log(`New member joined: ${member.user.tag}`)
    try {
        const response = await fetch(`${backendUrl}/api/v1/discord/verify-member?discord_tag=${encodeURIComponent(member.user.tag)}`)
        
        const data = await response.json()

        console.log('Response from Hacktrack:', data)

        if (!response.ok) {
            console.log(`Member ${member.user.tag} does not exist in the system.`)

            await member.kick('Member not found in Hacktrack system')

            console.log(`Kicked member ${member.user.tag} from the guild.`)
            return
        }

        console.log(`Member ${member.user.tag} exists in the system. Proceeding with welcome message and role assignment.`)
        
        // assign "name" from data to the member's nickname
        if (data.member?.name) {
            await member.setNickname(data.member.name)
            console.log(`Set nickname of ${member.user.tag} to ${data.member.name}`)
        }

        // assign members role to the member
        const role = member.guild.roles.cache.find(r => r.name === 'members')
        if (role) {
            await member.roles.add(role)
            console.log(`Assigned 'members' role to ${member.user.tag}`)
        } else {
            console.log(`Role 'members' not found in the guild.`)
        }

        console.log('Sent "hi" to Discord channel for new member')
    } catch (error) {
        console.error('Error sending message for new member:', error)
    }
}