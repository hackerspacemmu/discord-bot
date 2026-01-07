// this checks when a new member is added, it sends a hi!
import { GuildMember } from 'discord.js'
import { execute as sendHi } from '../messages/sendHi.js'
import { execute as fuckOff } from '../messages/fuckOff.js'

/**
 * 1. Fetch Hacktrack endpoint to determine if member exists or not in the system
 * 2. If doesn't exist, handle response and ask permission from admin if its okay to kick member
 * 3. If exist, greet with welcome message and use the fetched data (where the name is given) and change to username of the member to their given name
 * 4. Then assign the role "members" to that member.
 */
export async function checkNewMemberEntry(member: GuildMember) {
    console.log(`New member joined: ${member.user.tag}`)
    try {
        const response = await fetch(`http://localhost:3000/api/v1/discord/verify-member?discord_tag=${encodeURIComponent(member.user.tag)}`)
        
        const data = await response.json()

        console.log('Response from Hacktrack:', data)

        if (!response.ok) {
            // 404 or other error status
            console.log(`Member ${member.user.tag} does not exist in the system.`)

            await fuckOff(`${member.user.tag}`)

            // kick the member from the guild
            await member.kick('Member not found in Hacktrack system')

            console.log(`Kicked member ${member.user.tag} from the guild.`)
            return
        }

        await sendHi(member.user.tag)
        
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