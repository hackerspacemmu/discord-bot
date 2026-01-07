import express, { Express } from 'express'
import { port } from '../config/env.js'
import apiRoutes from '../routes/apiRoutes.js'

export const app: Express = express()

app.use(express.json())

function loadRoutes() {
    app.use('/api', apiRoutes)
    
    
    // 404 handler for debugging
    app.use((req, res) => {
        res.status(404).json({ 
            error: 'Route not found', 
            path: req.path,
            method: req.method 
        })
    })
}

export function startExpressServer() {
    loadRoutes()
    
    app.listen(port, () => {
        console.log(`Express server running on port ${port}`)
        console.log(`Available routes: GET /api/test`)
    })
}

