require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cookieParser = require('cookie-parser')
const port = process.env.PORT || 5000;

app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "https://restaurant-a10-ph.web.app",
        "https://restaurant-a10-ph.firebaseapp.com",
      ],
      credentials: true,
    })
  );
app.use(express.json());
app.use(cookieParser())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ptqba.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// verifyToken
const verifyToken = (req, res, next) => {
    const token = req.cookies?.token
    if (!token) return res.status(401).send({ message: 'unauthorized access' })
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.user = decoded
    })

    next()
}
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const foodCollection = client.db("foodDB").collection("food")
        const purchaseCollection = client.db("foodDB").collection("purchase")

            // generate jwt
    app.post('/jwt', async (req, res) => {
      const email = req.body
      // create token
      const token = jwt.sign(email, process.env.SECRET_KEY, {
        expiresIn: '365d',
      })
      // console.log(token)
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
    })

    // logout || clear cookie from browser
    app.get('/logout', async (req, res) => {
      res
        .clearCookie('token', {
          maxAge: 0,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
    })
        // add  food data to db
        app.post('/addfood', async (req, res) => {
            const foodAdded = req.body;
            const result = await foodCollection.insertOne(foodAdded);
            res.send(result);
        })
        //food purchase 
        app.post('/purchase', async (req, res) => {
            const purchase = req.body;
            // console.log(purchase);
            const result = await purchaseCollection.insertOne(purchase);
            const filter = { _id: new ObjectId(purchase.foodId) }
            const update = {
                $inc: { purchaseCount: 1 },
            }
            const updateFoodCount = await foodCollection.updateOne(filter, update)
            // console.log(updateFoodCount)
            res.send(result);
        })

        //food order page 
        app.get('/purchase/:email', verifyToken, async (req, res) => {
            const email = req.params.email
            const decodedEmail = req.user?.email
            // console.log("from user",email);
            // console.log("from token", decodedEmail);
            if (decodedEmail !== email)
                return res.status(401).send({ message: 'unauthorized access' })
            // console.log(req.user.email);
            const query = { buyerEmail: email }
            const result = await purchaseCollection.find(query).toArray();
            res.send(result)
        }
        )
        // food delete
        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await purchaseCollection.deleteOne(query);
            res.send(result);
        })
        // get all food data from db

        app.get('/food/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await foodCollection.findOne(query)
            res.send(result)
        })

        // food count
        app.get('/foodCount', async (req, res) => {
            count = await foodCollection.estimatedDocumentCount();
            res.send({ count });
        })
        // all food page
        app.get('/foods', async (req, res) => {
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            const search = req.query.search
            // console.log(search);
            let query = {
                foodName: {
                    $regex: search,
                    $options: 'i',
                },
            }
            const result = await foodCollection.find(query)
                .skip(page * size)
                .limit(size)
                .toArray();
            res.send(result);
        })

        // get all food for top food page

        app.get('/topFood', async (req, res) => {
            const result = await foodCollection.find().sort({ purchaseCount: -1 }).limit(6).toArray();
            res.send(result)
        }
        )
        // myAdded food
        app.get('/myFood/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const result = await foodCollection.find(query).toArray();
            res.send(result)
        }
        )
        //   update food data

        app.put('/update-food/:id', async (req, res) => {
            const id = req.params.id
            const foodData = req.body
            const updated = {
                $set: foodData,
            }
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const result = await foodCollection.updateOne(query, updated, options)
            // console.log(result)
            res.send(result)
        })


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
    res.send('Food Zone server is running')
});
app.listen(port, () => {
    console.log(`Food server is running on port ${port}`);
})