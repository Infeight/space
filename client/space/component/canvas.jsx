import React from 'react'
import { useRef,useEffect,useState } from 'react'
import Chat from './chat'
import './canvas.css'
import socket from './socketfront'
import { io } from 'socket.io-client'


const Canvas = (props) => {
  
  const canvas = useRef();
  
    const [frontEndUsers,setfrontEndUsers] = useState([]);
    const [toid,setToid] = useState('');
    const [toname,setToname] = ('');
   const [position,setPosition] = useState({
    x:0,
    y:0
   })

    const userid = localStorage.getItem('current-id1');

  //  const canvas = document.getElementById('canvas');

   useEffect(()=>{
                socket.emit('updateUsers')
   },[])


   let frontEnd = {};



  socket.on("updateUsers1",(Users)=>{
    
    for(const id in Users){
           
      const onlineuser = Users[id];
         if(!frontEnd[id]){
          frontEnd[id] =new Character (onlineuser.x, onlineuser.y, 0 ,0 , onlineuser.curuserid, onlineuser.color)
          
         }
         else{
          frontEnd[id].x = onlineuser.x
          frontEnd[id].y = onlineuser.y
          
         }
    }   
    for(const id in frontEnd){
      if(!Users[id]){
        delete frontEnd[id];
      }
    }


  
    // socket.off("updateUsers1");
  })


   
  

          
        

   const leave = ()=>{
    delete frontEnd[socket.id]
     socket.emit('removeUser',socket.id)
    
   }
   
   function Character(x,y,dx,dy,id,color){ 

    const box = document.getElementById('testbox')
    // box.innerHTML = ''
 const boxdet = document.getElementById('testbox').getBoundingClientRect()

   
   this.color = color;
    this.x = x;
    this.y = y; this.dx = dx; this.dy = dy;
    this.id = id;

    addEventListener('change',()=>{
         console.log(this.x,this.y)
    })

    this.talk = chars =>{
      for(const i in chars){
        if(this === chars[i]) continue;

        if(
          this.x + 40 >= chars[i].x &&
          this.x<= chars[i].x+ 40 &&
          this.y+ 40 >= chars[i].y &&
          this.y<= chars[i].y+40
        ){
          this.color = 'black'
          chars[i].color = 'black'
        }
      }
    }

    this.draw = function(){
      const curcanvas = canvas.current
      ctx = curcanvas.getContext('2d')
     ctx.fillStyle = this.color;
     ctx.clearRect(0,0,window.innerWidth,window.innerHeight)
     ctx.fillRect(this.x+this.dx,this.y+this.dy,40,40)
    }

    }


   let ctx;let vx=0; let vy=0;

 
   window.addEventListener('keydown',(e)=>{

   if(!frontEnd[socket.id]){return}

   switch(e.key){
    case 'd' || 'D':
      // frontEnd[socket.id].x+=10;
      socket.emit('keydown','keyD')
      break
    case 'a' || 'A':
      // frontEnd[socket.id].x-=10;
      socket.emit('keydown','keyA')
      break
    case 's' || 'S':
      // frontEnd[socket.id].y+=10;
      socket.emit('keydown','keyS')
      break
    case 'w' || 'W':
      // frontEnd[socket.id].y-=10;
      socket.emit('keydown','keyW')
      break      
   }
  
  })


  let animationId;
  function animate(){
animationId = requestAnimationFrame(animate)
// ctx.clearRect(0,0,window.innerWidth,window.innerHeight)

 for(const id in frontEnd){
     const user = frontEnd[id]
     user.draw()
     user.talk(frontEnd)
 }


  }
  animate();

       
       
       const createtest = async()=>{
        const testdet = {
          username:'tarun',
          password:'tarun7'
        }

   const createtest = fetch('https://spaceserver-05iz.onrender.com/createtest',{ method: 'post', headers: { "Content-Type": "application/json" }, body: JSON.stringify(testdet) })
       createtest.then(response=>response.json()).then((data)=>{
       const useridcont = document.createElement('div')
       useridcont.id = 'useridcont'
       useridcont.className = 'useridcont'
       useridcont.innerHTML = data.test._id
        document.getElementById('testbox').appendChild(useridcont)
       })
  }

  const handlechat = (e)=>{
 const boxdet1 = document.getElementById('testbox').getBoundingClientRect()
    ctx.clearRect(0,0,canvas.current.width,canvas.current.height)
    
    setToid(e.target.closest('.testbox').querySelector('.useridcont').innerHTML)
  }
  
  createtest();

  const todet = {
    toname:'Tarun',
    toid:toid
  }


  return (

    <div id='space_1'>
    <canvas ref={canvas} width={1400} height={900} id='canvas' {...props}></canvas>
    <div className='testbox' id='testbox'>
    <button id='chat' style={{display:'none'}} onClick={handlechat}>Chat</button>
    </div>
     {
     toid !=''? <Chat todet = {todet}/>: <></>
     }

     <button id='leave' onClick={leave}>Leave</button>
    </div>
  )
}

export default Canvas
