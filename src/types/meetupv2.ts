import { Member } from "./member.js"
import { Update } from "./update.js"

export interface MeetupCommand {
    "id": number,
    "date": string,
    "number": number,
    "category": string,
    "host_id": number,
    "created_at": string,
    "updated_at": string,
    "hackathon_number": number,
    "updates": Update[]
    "host": Member
}
