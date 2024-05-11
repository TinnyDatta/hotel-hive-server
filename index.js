const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wlyr1jn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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

const bookingCollection = client.db('hotelBooking').collection('bookings');
const addingCollection = client.db('hotelBooking').collection('addings');

// read data for room page
app.get('/bookings', async(req, res) => {
  const cursor = bookingCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})

// bookDetails page
app.get('/singleRoom/:id', async(req, res) =>{
  console.log(req.params.id)
  const result = await bookingCollection.findOne({_id:new ObjectId(req.params.id)})
  console.log(result)
  res.send(result)
})

// my bookings
app.post('/addings', async(req, res) => {
  const adding = req.body;
  console.log(adding)
  const result = await addingCollection.insertOne(adding);
  res.send(result)
})

// featured room
// app.get('/bookings', async(req,res) =>{
//   console.log(req.query.price_per_night<200);
//   let query = {};
//   if (req.query?.price_per_night){
//     query = {price_per_night : req.query.price_per_night<200}
//   }
//   const result = await bookingCollection.find(query).toArray();
//   res.send(result);
// })


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
    res.send('HotelHive is running')
})

app.listen(port, () => {
    console.log(`HotelHive is running on port : ${port}`)
})
