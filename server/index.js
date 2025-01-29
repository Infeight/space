const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);


const cors = require('cors')
const bodyParser = require('body-parser')
const login = require('./mongodb')
const online = require('./mongodb')
const messages = require('./mongodb')
const port  = 5001;


app.use(cors());
app.use(bodyParser.json())

server.listen(port,()=>{
    console.log(`Listening on ${port} `);
})

const io = new Server(server,{
  cors: {
    origin: "http://localhost:5173", // Replace with your client URL
    methods: ["GET", "POST"],
},
})
// const io = require('socket.io')(server)
global.onlineusers = new Map();
let onlineobj = {}
let usersarr = [];
let cursuseridstore = ''

io.on('connection',(socket)=>{

  // const existingSockets = Array.from(io.sockets.sockets.keys());
  // if (existingSockets.length > 1) {
  //   console.log('Closing duplicate connection:', socket.id);
  //   socket.disconnect();
  // }

  
console.log('socket is working' + socket.id)

 global.chatSocket = socket;
 socket.on('add-user',(curuserid)=>{
 cursuseridstore  = curuserid;
   onlineusers.set(curuserid,socket.id)

  onlineobj[socket.id] = {
    curuserid: curuserid,
    x: Math.random()* 500,
    y: Math.random()* 500,
    color: `hsl(${Math.random()*360},100%,50%)`
  }

  console.log(onlineobj)

 
  
 })

 socket.on('updateUsers',()=>{
  socket.emit("updateUsers1",(onlineobj));
 })

 socket.on('removeUser',(userid)=>{
  // usersarr.pop( Array.prototype.filter(function(user){
  //       user.socket == socket.id 
  //  }))
  onlineusers.delete(userid)

  delete onlineobj[userid];
 })

 socket.on('disconnect',(reason)=>{
   console.log(reason)
   delete onlineobj[socket.id];
 })

 socket.on('sendmsg',(msgdata)=>{
  const senduser = onlineusers.get(msgdata.to)
  // console.log(msgdata)
  if(senduser){
    socket.to(senduser).emit("recievemsg",msgdata.msg)
  }
})

//  usersarr.filter((user)=>user.socket == socket.id)
socket.on('keydown',(keycode)=>{
    switch(keycode){

      case 'keyW':
       
        onlineobj[socket.id].y-=10;
        break

      case 'keyA':
        onlineobj[socket.id].x-=10;
        break

      case 'keyD':
      onlineobj[socket.id].x+=10;
        break

      case 'keyS':
        onlineobj[socket.id].y+=10;
        break      
    }
})

})

setInterval(()=>{
  io.emit("updateUsers1",onlineobj);
},15)


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





