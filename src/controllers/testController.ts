import { Request, Response } from 'express'
import { execute as sendHi } from '../commands/messages/sendHi.js'

export async function sendHiHandler(req: Request, res: Response) {
    console.log('Sending hi to Discord channel')
    try {
        res.json({ success: true, message: 'Sent "hi" to Discord channel' })
    } catch (error) {
        console.error('Error sending message:', error)
        res.status(500).json({ error: 'Failed to send message' })
    }
}
