const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: [
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wlyr1jn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// middlewares
const logger = (req, res, next) => {
  console.log('log info', req.method, req.url)
  next();
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

const bookingCollection = client.db('hotelBooking').collection('bookings');
const addingCollection = client.db('hotelBooking').collection('addings');

// token
app.post('/jwt', logger, async(req, res) => {
   const user = req.body;
   console.log('user token', user);
   const token = jwt.sign(user, process.env.TOKEN_SECRET, {expiresIn: '1h'});

   res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
   })
   .send({success: true})
})

app.post('/logout', async(req, res) => {
  const user = req.body;
  console.log('logging out', user)
  res.clearCookie('token', {maxAge: 0}).send({success: true})
})


// read data for room page
app.get('/bookings', async(req, res) => {
  // const filter = req.query.filter
  // console.log(filter)
  // let query = {}
  // if (filter) query = {category : filter}
  const cursor = bookingCollection.find();
  const result = await cursor.toArray();
  res.send(result);
  // console.log(result)
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

app.get('/addings/:id', async(req, res) => {
  const id = req.params.id;
  const query = {_id : new ObjectId(id)}
  const result = await addingCollection.findOne(query) 
  res.send(result)
})

app.put('/addings/:id', async(req, res) => {
  const id = req.params.id;
  const filter = {_id: new ObjectId(id)}
  const options = { upsert: true };
  const data = {
    $set: {
      deadline : req.body.deadline
    }
  }
  const result = await addingCollection.updateOne(filter, data, options) 
  res.send(result)
})

app.get('/myBooking/:email', logger, async(req, res) => {
  console.log(req.params.email);
  console.log('cok cok', req.cookies);
  const result = await addingCollection.find({email:req.params.email}).toArray();
  res.send(result);
})

app.delete('/delete/:id', async(req,res) => {
  const result = await addingCollection.deleteOne({_id: new ObjectId(req.params.id)})
  console.log(result)
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
