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
const tasks = require('./mongodb');
const { finished } = require('stream');
// const { finished } = require('stream');
// const { default: socket } = require('../client/space/component/socketfront');
const port  = 5001;


app.use(cors());
app.use(bodyParser.json())

server.listen(port,()=>{
    console.log(`Listening on ${port} `);
})

const io = new Server(server,{
  cors: {
    origin: ["https://spacecc.onrender.com","http://localhost:8000/","http://localhost:5173","http://localhost:5174"], // Replace with your client URL
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

  
// console.log('socket is working' + socket.id)

 global.chatSocket = socket;
 socket.on('add-user',(curuserdet)=>{
 cursuseridstore  = curuserdet.id;
  //  onlineusers.set(curuserdet.id,socket.id)

   if (onlineusers.has(curuserdet.id)) {
    console.log("yes"+onlineusers.get(curuserdet.id))
  //  console.log(onlineusers)
    delete onlineobj[onlineusers.get(curuserdet.id)];
    socket.to(onlineusers.get(curuserdet.id)).emit("instance")

    onlineusers.set(curuserdet.id,socket.id)
    onlineobj[socket.id] = {
      curuserid: curuserdet.id,
      name: curuserdet.name,
      dp:curuserdet.dp,
      x: curuserdet.role == 'Manager'? 1100 :Math.floor(Math.random() * (800 - 200 + 1)) + 200,
      y: curuserdet.role == 'Manager'? 100: Math.floor(Math.random() * (800 - 400 + 1)) + 400,
      color: `hsl(${Math.random()*360},100%,50%)`,
      socketid: socket.id
    }
  }
  else{
    onlineusers.set(curuserdet.id,socket.id)
    onlineobj[socket.id] = {
      curuserid: curuserdet.id,
      name: curuserdet.name,
      dp:curuserdet.dp,
      x: curuserdet.role == 'Manager'? 1100 :Math.floor(Math.random() * (800 - 200 + 1)) + 200,
      y: curuserdet.role == 'Manager'? 100: Math.floor(Math.random() * (800 - 400 + 1)) + 400,
      color: `hsl(${Math.random()*360},100%,50%)`,
      socketid: socket.id
    }
  }

 

  // console.log(onlineobj)

 
  
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

 socket.on('wantchat',(details)=>{
    io.to(JSON.parse(details).socketid).emit('wantchat',JSON.parse(details))
 })

 socket.on('chatyes',(chatyesdet)=>{
 
    io.to(JSON.parse(chatyesdet).socketid).emit('chatyes',chatyesdet)
 })

 socket.on('chatno',(chatnodet)=>{
  
    io.to(JSON.parse(chatnodet).socketid).emit('chatno',chatnodet)
 })

 socket.on('joinmeet',()=>{
  socket.join('meeting');
  socket.emit('joined-meet');

})

socket.on('leavemeet',()=>{
  socket.leave('meeting');
  socket.emit('left-meet');

})

socket.on('announcement', (data) => {
  socket.to('meeting').emit('announcement', data); // Send to others in 'meeting' room
});

 socket.on('announce_all',(data)=>{
    socket.broadcast.emit('announce_all_received',data)
    console.log('broadcasting')
 })

 socket.on('joincoffee',()=>{
  socket.join('coffeeroom');
  socket.emit('joined-coffee');

})
socket.on('leavecoffee',()=>{
  socket.leave('coffeeroom');
  socket.emit('left-coffee');
})

socket.on('coffeechat', (data) => {
  socket.to('coffeeroom').emit('coffeechat', data); // Send to others in 'meeting' room
});

socket.on('joinbrainstorm',(data)=>{
  socket.join('brainstorm');
  console.log('Joined meeting');
  socket.emit('joined-brain');
  socket.to('brainstorm').emit("joined-brain", data);
})

socket.on('brainchat', (data) => {
  socket.to('brainstorm').emit('brainchat', data); // Send to others in 'meeting' room
});

socket.on("user:call", ({  offer }) => {
  socket.to('brainstorm').emit("incomming:call", { from: socket.id, offer });
});


socket.on("call:accepted", ({  ans }) => {
  socket.to('brainstorm').emit("call:accepted", { from: socket.id, ans });
});

socket.on("peer:nego:needed", ({  offer }) => {
  // console.log("peer:nego:needed", offer);
  socket.to('brainstorm').emit("peer:nego:needed", { from: socket.id, offer });
});

socket.on("peer:nego:done", ({  ans }) => {
  // console.log("peer:nego:needed", offer);
  socket.to('brainstorm').emit("peer:nego:final", { from: socket.id, ans });
});

socket.on('draw',(data)=>{
  socket.to('brainstorm').emit('draw',data);
})

socket.on('down',(data)=>{
  socket.to('brainstorm').emit('down',data);
})

socket.on('leave-brain',()=>{
  socket.leave('brainstorm')
  socket.emit('left-brain');
})

socket.on('taskassigned',(data)=>{
  const senduser = onlineusers.get(data)
  socket.to(senduser).emit('taskassigned');
})



 socket.on('disconnect',(reason)=>{
   console.log(reason)
   delete onlineobj[socket.id];
 })

 socket.on('sendmsg',(msgdata)=>{
  const senduser = onlineusers.get(msgdata.to)
  console.log(msgdata.to)
  if(senduser){
    socket.to(senduser).emit("recievemsg",msgdata.msg)
  }
})

socket.on('discussimg',(msgdata)=>{
  // console.log(msgdata)
  socket.to('meeting').emit('discussimg',msgdata)
})

socket.on('announceimg',(msgdata)=>{
  socket.broadcast.emit('announceimg',msgdata)
})

socket.on('sendmsg',(data)=>{

  socket.to(data.to).emit('recievemsg',data)
})




//  usersarr.filter((user)=>user.socket == socket.id)
socket.on('keydown',(keycode)=>{
    if(socket.id){
      switch(keycode){

        case 'keyW':
         
          try{onlineobj[socket.id].y-=10;}
          catch(e){console.log(e)}
          break
  
        case 'keyA':
          try{onlineobj[socket.id].x-=10;}
          catch(e){console.log(e)}
          break
  
        case 'keyD':
        try{ onlineobj[socket.id].x+=10;}
          catch(e){console.log(e)}
          break
  
        case 'keyS':
          try{ onlineobj[socket.id].y+=10;}
          catch(e){console.log(e)}
          break      
      }
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
    email: req.body.mail,
    role: req.body.role,
    dp:req.body.dp
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

app.post('/getmsg', async (req, res) => {
  const { from_id, toid } = req.body;
 

  try {
    const getmsg = await messages.messages.find({
      users: { $all: [from_id, toid] }
    }).sort({ updatedAt: 1 });


    const projectmsgs = getmsg.map(msg => ({
      fromself: msg.sender.toString() === from_id,
      message: msg.message.text
    }));
  //  console.log(projectmsgs)
    res.json(projectmsgs);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/gettask',async(req,res)=>{
  const {userid} = req.body
  const gettask = await tasks.tasks.find({
    assigned:{
      $all:userid
    }
  })

  // console.log(gettask);

  const projectmsgs = gettask.map(msg=>{
    return{
     task:msg,

    }
  })
  res.json(projectmsgs)
 
})

app.post('/task',async(req,res)=>{
  const {task,userid,deadline,name} = req.body
  const data = await tasks.tasks.create(
    {
      task:task,
      deadline:deadline,
      assigned: userid,
      assignedname:name,
      finished:false
    }
  )
  const stat = {done:userid}
  if(data) res.json(stat)
})

app.get('/alltasks',async(req,res)=>{
  const gettask = await tasks.tasks.find();
  // console.log(gettask)/
  res.send(gettask);
})

app.post('/taskdone',async(req,res)=>{
  const {taskid} = req.body
  console.log(taskid)
  const data = await tasks.tasks.updateOne({_id: taskid  },  { $set: { finished: true } })
  const stat = {done:data.assignedname}
  if(data) res.json(stat)


})
// console.log(messages.messages.find({ assigned: { $all: ["67e75a03a7f184ee2c690dd0", "67e751b0b5164414adff1370"] } }).sort({ updatedAt: 1 }))


