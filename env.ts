import dotenv from 'dotenv'

dotenv.config()

export const discordBotApplicationId = process.env.DISCORD_BOT_APPLICATION_ID as string
export const discordBotPublicKey = process.env.DISCORD_BOT_PUBLIC_KEY as string
export const discordBotToken = process.env.DISCORD_BOT_TOKEN as string
export const discordBotOauth2GeneratedUrl = process.env.DISCORD_BOT_OAUTH2_GENERATED_URL as string