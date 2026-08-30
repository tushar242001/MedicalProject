import 'dotenv/config'
import { MongoClient } from 'mongodb'

const medicines = [
  { id: 1, name: 'Dolo 650', generic: 'Paracetamol 650mg', category: 'Pain relief', stock: 128, price: 32, expiry: 'Aug 2026', status: 'In stock' },
  { id: 2, name: 'Azithral 500', generic: 'Azithromycin 500mg', category: 'Antibiotic', stock: 12, price: 118, expiry: 'Mar 2026', status: 'Low stock' },
  { id: 3, name: 'Telma 40', generic: 'Telmisartan 40mg', category: 'Cardiac care', stock: 64, price: 74, expiry: 'Nov 2026', status: 'In stock' },
  { id: 4, name: 'Shelcal 500', generic: 'Calcium + Vitamin D3', category: 'Supplements', stock: 0, price: 112, expiry: 'Jan 2027', status: 'Out of stock' },
  { id: 5, name: 'Cetirizine 10', generic: 'Cetirizine Hydrochloride', category: 'Allergy care', stock: 86, price: 24, expiry: 'May 2027', status: 'In stock' },
  { id: 6, name: 'ORS Apple', generic: 'Oral rehydration salts', category: 'Wellness', stock: 41, price: 22, expiry: 'Dec 2026', status: 'In stock' },
]

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured')

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const database = client.db(process.env.MONGODB_DB || 'meddesk')
const collection = database.collection('medicines')

await collection.createIndex({ id: 1 }, { unique: true })
await collection.bulkWrite(medicines.map((medicine) => ({
  updateOne: {
    filter: { id: medicine.id },
    update: { $set: { ...medicine, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    upsert: true,
  },
})))

console.log(`Seeded ${medicines.length} medicines into ${database.databaseName}.medicines`)
await client.close()
