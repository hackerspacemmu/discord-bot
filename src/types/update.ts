import { Project } from "./project.js";

export interface Update {
    "id": number,
    "meetup_id": number,
    "project_id": number,
    "member_id": number,
    "category": string,
    "description": string,
    "created_at": string,
    "updated_at": string,
    "project"?: Project
}