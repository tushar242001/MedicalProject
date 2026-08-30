import 'dotenv/config'
import express from 'express'
import { MongoClient } from 'mongodb'

const app = express()
const port = process.env.API_PORT || 3001
const client = process.env.MONGODB_URI ? new MongoClient(process.env.MONGODB_URI) : null
let database

app.use(express.json())

async function getDatabase() {
  if (!client) return null
  if (!database) {
    await client.connect()
    database = client.db(process.env.MONGODB_DB || 'meddesk')
  }
  return database
}

app.get('/api/health', async (_request, response) => {
  try {
    const db = await getDatabase()
    if (!db) return response.json({ connected: false, message: 'MONGODB_URI is not configured' })
    await db.command({ ping: 1 })
    return response.json({ connected: true })
  } catch (error) {
    return response.status(503).json({ connected: false, message: error.message })
  }
})

app.get('/api/medicines', async (_request, response) => {
  try {
    const db = await getDatabase()
    if (!db) return response.json([])
    const medicines = await db.collection('medicines').find({}).sort({ name: 1 }).toArray()
    return response.json(medicines)
  } catch (error) {
    return response.status(500).json({ error: error.message })
  }
})

app.post('/api/medicines', async (request, response) => {
  try {
    const db = await getDatabase()
    if (!db) return response.status(503).json({ error: 'MongoDB is not configured' })
    const medicine = { ...request.body, createdAt: new Date(), updatedAt: new Date() }
    const result = await db.collection('medicines').insertOne(medicine)
    return response.status(201).json({ ...medicine, _id: result.insertedId })
  } catch (error) {
    return response.status(400).json({ error: error.message })
  }
})

app.patch('/api/medicines/:id/stock', async (request, response) => {
  try {
    const db = await getDatabase()
    if (!db) return response.status(503).json({ error: 'MongoDB is not configured' })
    const delta = Number(request.body.delta)
    if (!Number.isInteger(delta) || delta === 0) return response.status(400).json({ error: 'delta must be a non-zero integer' })
    const filter = delta < 0 ? { id: Number(request.params.id), stock: { $gte: Math.abs(delta) } } : { id: Number(request.params.id) }
    const result = await db.collection('medicines').findOneAndUpdate(filter, { $inc: { stock: delta }, $set: { updatedAt: new Date() } }, { returnDocument: 'after' })
    if (!result) return response.status(409).json({ error: 'Insufficient stock or medicine not found' })
    return response.json(result)
  } catch (error) {
    return response.status(400).json({ error: error.message })
  }
})

app.post('/api/bills', async (request, response) => {
  try {
    const db = await getDatabase()
    if (!db) return response.status(503).json({ error: 'MongoDB is not configured' })
    const { items, customerPhone, paymentMethod = 'upi' } = request.body
    if (!Array.isArray(items) || items.length === 0) return response.status(400).json({ error: 'A bill must contain at least one item' })
    const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0)
    const bill = { items, customerPhone, paymentMethod, total, createdAt: new Date() }
    const result = await db.collection('bills').insertOne(bill)
    return response.status(201).json({ ...bill, _id: result.insertedId })
  } catch (error) {
    return response.status(400).json({ error: error.message })
  }
})

app.listen(port, () => console.log(`Meddesk API running at http://localhost:${port}`))
