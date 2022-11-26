const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

/* Middleware */
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wjboujk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        const categoriesCollection = client.db('carDealer').collection('categories')
        const usersCollection = client.db('carDealer').collection('users')
        const categoryProductsCollection = client.db('carDealer').collection('category-products')
        const ordersCollection = client.db('carDealer').collection('orders')


        /* Get categories data */
        app.get('/categories', async (req, res) => {
            const query = {}
            const result = await categoriesCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/category-products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { categoryID: id }
            const result = await categoryProductsCollection.find(query).toArray()
            res.send(result)
        })

        app.post('/orders', async (req, res) => {
            const order = req.body
            const result = await ordersCollection.insertOne(order)
            res.send(result)
        })

    } finally {

    }
}
run().catch(e => console.error(e))

app.get('/', (req, res) => {
    res.send(`Hey i'm calling from car dealer server`)
})
app.listen(port, () => {
    console.log('Server running on ', port)
})