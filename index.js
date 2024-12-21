
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ptqba.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const equipmentCollection = client.db("restaurantDB").collection("restaurant")
        // const userCollection = client.db("coffeeDB").collection("users")
                // app.post('/equipment', async (req, res) => {
                //     const newEquipment = req.body;
                //     console.log(newEquipment);
                //     const result = await equipmentCollection.insertOne(newEquipment);
                //     res.send(result);
                // })
                // app.get('/equipment', async (req, res) => {
                //     // db.collectionName.find().limit(6);
                //     const result = await equipmentCollection.find().limit(8);
                //     res.send(result);
                // })
                // app.get('/equipment/:id', async (req, res) => {
                //     const id = req.params.id;
                //     const query = { _id: new ObjectId(id) }
                //     const result = await equipmentCollection.findOne(query);
                //     res.send(result);
                // })
                // app.delete('/equipment/:id', async (req, res) => {
                //     const id = req.params.id;
                //     const query = { _id: new ObjectId(id) };
                //     const result = await equipmentCollection.deleteOne(query);
                //     res.send(result);
                // })
                // app.put('/equipment/:id', async (req, res) => {
                //     const id = req.params.id;
                //     const filter = { _id: new ObjectId(id) };
                //     const options = { upsert: true };
                //     const updated = req.body;
                //     const equipment = {
                //         $set: {
                //             image: updated.image,
                //             itemName: updated.itemName,
                //             categoryName: updated.categoryName,
                //             description: updated.description,
                //             price: updated.price,
                //             rating: updated.rating,
                //             batWithGrip: updated.batWithGrip,
                //             hitPaper: updated.hitPaper,
                //             processingTime: updated.processingTime,
                //             stockStatus: updated.stockStatus
                //         }
                //     }
                //     const result = await equipmentCollection.updateOne(filter, equipment, options);
                //     res.send(result);
                // }

                // )


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Spots Zone server is running')
});
app.listen(port, () => {
    console.log(`Spots server is running on port ${port}`);
})