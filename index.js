const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

/* Middleware */
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wjboujk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const verifyJWT = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) {
        res.status(401).send({ message: 'unauthorized access' })
    }
    const token = header.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
        if (error) {
            return res.status(403).send({ message: "forbidden" })
        }

        req.decoded = decoded
        next()
    })

}

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

        /* Get single category products */
        app.get('/category-products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { categoryID: id }
            const result = await categoryProductsCollection.find(query).toArray()
            res.send(result)
        })


        /* Get all buyers */

        app.get('/users/buyers', async (req, res) => {
            const query = { userRole: 'Buyer' }
            const buyers = await usersCollection.find(query).toArray()
            res.send(buyers)
        })
        /* Get all sellers */
        app.get('/users/sellers', async (req, res) => {
            const query = { userRole: 'Seller' }
            const sellers = await usersCollection.find(query).toArray()
            res.send(sellers)
        })




        /* Store users */
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        /* Get jwt access token */
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const filter = { email: email }
            const user = await usersCollection.findOne(filter)
            if (!user) {
                return res.status(401).send({ message: 'Unauthorized access' })
            } else if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '7d' })
                return res.send({ accessToken: token })
            }
        })

        app.put('/users/verify/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    userVerify: "true"
                }
            }

            const result = await usersCollection.updateOne(filter, updateDoc, options)

            res.send(result)
        })


        /* Before getting order we have verify access token */
        app.get('/orders', verifyJWT, async (req, res) => {
            const email = req.query.email
            if (!email === req.decoded.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const filter = { buyerEmail: email }
            const orders = await ordersCollection.find(filter).toArray()
            res.send(orders)
        })
        /* Store users orders */
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