const express = require('express');
const app = express();
const socket =require('socket.io')
const cors = require('cors')
const bodyParser = require('body-parser')
const login = require('./mongodb')
const online = require('./mongodb')
const messages = require('./mongodb')
const port  = 5001;


app.use(cors());
app.use(bodyParser.json())
const server = app.listen(port,()=>{
    console.log(`Listening on ${port} `);
})


const io = socket(server,{
  cors:{
    origin:'http://localhost:5173',
    Credential:true
  }
})
// const io = require('socket.io')(server)
global.onlineusers = new Map();
let usersarr = [];

io.on('connection',(socket)=>{
console.log('socket is working')
 global.chatSocket = socket;
 socket.on('add-user',(curuserid)=>{
   onlineusers.set(curuserid,socket.id)
    usersarr.push({
      userid: curuserid,
      socket:socket.id,
      x: Math.random()* 500,
      y: Math.random()* 500,
      color: `hsl(${Math.random()*360},100%,50%)`
    })
 })

 socket.on('updateUsers',()=>{
  socket.emit("updateUsers1",(usersarr));
 })

 socket.on('removeUser',(userid)=>{
  usersarr.pop( Array.prototype.filter(function(user){
        user.socket == socket.id 
   }))
  onlineusers.delete(userid)
 })

 socket.on('disconnect',(reason)=>{
   console.log(reason)
 })

 socket.on('sendmsg',(msgdata)=>{
  const senduser = onlineusers.get(msgdata.to)
  // console.log(msgdata)
  if(senduser){
    socket.to(senduser).emit("recievemsg",msgdata.msg)
  }
})

console.log(usersarr)

})


app.get('/',(req,res)=>{
    res.send("dkcjnskj")
})


// app.get('/getusers',(req,res)=>{
//   let userarr = [];
//   const obj = Object.fromEntries(onlineusers)
//   userarr.push(obj)
  
//    res.send(userarr)
// })

app.get('/getalllogin',async(req,res)=>{
  const alllogins = await login.login.find();
  res.send(alllogins);
})

app.get('/online',async(req,res)=>{
   const onlineusers = await online.online.find();
   res.send(onlineusers)
})

app.post('/login', async(req,res)=>{
  const data = {
   username: req.body.username,
   password: req.body.password
  }
  
 const loggedin = await login.login.findOne({username:data.username, password:data.password})

//  const onlinedet = {
//      username: data.username,
//      id : loggedin._id
//  }
 
//  await online.online.insertMany(onlinedet)



 res.json({loggedin:loggedin})
 
})


app.post('/signup',async(req,res)=>{
  let signupdata = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.mail
  }
if(signupdata.username!=''&& signupdata.password!=''){
 await login.login.insertMany(signupdata)
//  res.cookie('data',signupdata.username)

}
else{console.log('can not sign up')}

})

app.post('/createtest', async(req,res)=>{
  const data = {
   username: req.body.username,
   password: req.body.password
  }
 const test = await login.login.findOne({username:data.username, password:data.password})

 res.json({test:test})
 
})


app.post('/sendmsg', async(req,res)=>{
  const {from_id,toid,message} = req.body
  const data = await messages.messages.create(
    {
      message:{
        text: message
      },
      users:[from_id,toid],
      sender: from_id,

    }
  )
  if(data) return({msg:"message added"})
    return({msg:"failed to add message"})

})

app.post('/getmsg',async(req,res)=>{
  const{from_id,toid} = req.body

  const getmsg = await messages.messages.find({
    users:{
      $all:[from_id,toid]
    }
  })
  .sort({updatedAt:1})

  const projectmsgs = getmsg.map(msg=>{
    return{
      fromself: msg.sender.toString() === from_id,
      message: msg.message.text
    }
  })
  res.json(projectmsgs)
})





