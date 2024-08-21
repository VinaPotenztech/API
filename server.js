//server.js
const express=require('express');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const User=require('./models/user');
const e = require('express');

const app=express();
const port=3000;

app.use(bodyParser.json());

//connect to mongo
mongoose.connect('mongodb://localhost:27017/register',{   
}).then(()=>console.log('Connected to MongoDB'))
.catch(err=>console.log('Could not connect to Mongo',err));

//API route for registration
app.post('/api/register',async(req,res)=>{
    const {firstname,lastname,email,password,country}=req.body;
    if(!firstname || !lastname || !email || !password || !country){
        return res.status(400).json({message:'All fields are required'});
    }
    try {

        const existinguser=await User.findOne({email});
        if(existinguser){
            return res.status(400).json({message:'email already registered'});
        }
        const newUser=new User({firstname,lastname,email,password,country});
        await newUser.save();

        res.status(201).json({message:'user registered successfully!',user:newUser});
    } catch (error) {
        res.status(500).json({message:'Error registering user.',error});
    }
});

// server.js (Add this below the registration route)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
  
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
  
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password.' });
      }
  
      // Compare password
      if (password!==user.password) {
        return res.status(400).json({ message: 'Invalid email or password.' });
      }
  
      // Successful login
      res.status(200).json({ message: 'Login successful!', user });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in.', error });
      console.log(error);
      
    }
  });
  
const PORT=5000;
//start server
app.listen(PORT,()=>{
    console.log(`Server is runnign on http://localhost:${PORT}`);
    
});