import dotenv from 'dotenv'

dotenv.config()

export const discordBotClientId = process.env.DISCORD_BOT_CLIENT_ID as string
export const discordBotPublicKey = process.env.DISCORD_BOT_PUBLIC_KEY as string
export const discordBotToken = process.env.DISCORD_BOT_TOKEN as string
export const discordBotOauth2GeneratedUrl = process.env.DISCORD_BOT_OAUTH2_GENERATED_URL as string
export const discordServerId = process.env.DISCORD_SERVER_ID as string
export const testChannelId = process.env.TEST_CHANNEL_ID as string
export const port = process.env.PORT || 4000
export const backendUrl = process.env.BACKEND_URL || `http://localhost:3000`
