
const mongoose = require ('mongoose')

mongoose.connect('mongodb+srv://srinivasaraodandugula7:bJkGg9vhqcNFS3c4@space.fkxxs.mongodb.net/').then(()=>{
    console.log('Connected to db')
}).catch(()=>{
    console.log("Sorry, There's an error!")
})

const loginScema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    }
})

const msgSchema = new mongoose.Schema({
    message:{
       text:{
        type:String,
        required:true
       }
    },
    users:Array,
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,

    }},
    {timestamps:true}

)

const onlineSchema = new mongoose.Schema({
    username :{
        type:String,
        required:true
    },
    id:{
        type:String,
        required: true
    }
})

const login = new mongoose.model('login',loginScema)
const messages = new mongoose.model('messages',msgSchema)
const online = new mongoose.model('online',onlineSchema)

module.exports = {login,messages,online}