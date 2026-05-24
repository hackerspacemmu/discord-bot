import dotenv from 'dotenv'

dotenv.config()

export const discordBotClientId = process.env.DISCORD_BOT_CLIENT_ID as string
export const discordBotToken = process.env.DISCORD_BOT_TOKEN as string
export const discordServerId = process.env.DISCORD_SERVER_ID as string
export const adminChannelId = process.env.ADMIN_CHANNEL_ID as string
export const adminRoleId = process.env.ADMIN_ROLE_ID as string

export const port = process.env.PORT || 4000
export const backendUrl = process.env.BACKEND_URL || `http://localhost:3000`