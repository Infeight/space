import React from 'react'
import { useRef,useEffect,useState } from 'react'
import Chat from './chat'
import './canvas.css'

import { io } from 'socket.io-client'


const Canvas = (props) => {
  const socket = useRef();
  
    const [users,setUsers] = useState([]);
    const [toid,setToid] = useState('');
    const [toname,setToname] = ('');
   const [position,setPosition] = useState({
    x:0,
    y:0
   })

    const userid = localStorage.getItem('current-id1');

   const canvas = useRef();

   useEffect(()=>{
        socket.current = io('http://localhost:5001')
        socket.current.emit('updateUsers')
   },[])


 useEffect(()=>{  // if there is current active socket and a recievemsg is called then Arraive message State is updated//
              if(socket.current){
           
                socket.current.on("updateUsers1",(User)=>{
                   User.map(person=>{
                       new Character(person.x, person.y, 0, 0, person.userid, person.color);
                   })
                })
              }
            })

   const leave = ()=>{
    
     socket.current.emit('removeUser',userid)
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


    addEventListener('keydown',(e)=>{
      if(e.key=='d'){
          ctx.clearRect(0,0,canvas.current.width,canvas.current.height)
      vx+=10;
        ctx.fillRect(x+vx,y+vy,40,40)
      this.talk(vx,vy);
      }
  
      if(e.key=='a'){
          ctx.clearRect(0,0,canvas.current.width,canvas.current.height)
      vx+=-10;
        ctx.fillRect(x+vx,y+vy,40,40)
      this.talk(vx,vy);
    }
  
      if(e.key=='w'){
          ctx.clearRect(0,0,canvas.current.width,canvas.current.height)
      vy+=-10;
        ctx.fillRect(x+vx,y+vy,40,40)
      this.talk(vx,vy);
      }
  
      if(e.key=='s'){
          ctx.clearRect(0,0,canvas.current.width,canvas.current.height)
      vy+=10;
        ctx.fillRect(x+vx,y+vy,40,40)
      this.talk(vx,vy);
      }
    })

    this.talk = function(vx,vy){
      if(this.x+vx >= (boxdet.x-10-(boxdet.width/2))   && this.y+vy >= (boxdet.y)){
            document.getElementById('chat').style.display = 'initial'
      }
     if(this.x+vx >= (boxdet.x-120 + boxdet.width ) || this.y+vy >= (boxdet.y + boxdet.height )){
          document.getElementById('chat').style.display = 'none'
      }
      if(this.x+vx < (boxdet.x-10-(boxdet.width/2))   || this.y+vy < (boxdet.y)){
          document.getElementById('chat').style.display = 'none'
 }

    }


    this.draw = function(){
      const curcanvas = canvas.current
      ctx = curcanvas.getContext('2d')
     ctx.fillStyle = this.color;
     ctx.fillRect(this.x+this.dx,this.y+this.dy,40,40)
    }
    this.draw();
    }


   let ctx;let vx=0; let vy=0;

    //  {users.map(user=>{
    //   let x= Math.random() * window.innerWidth; let y= Math.random() *window.innerHeight ;let vx=0; let vy=0;
    //  new Character(x,y,vx,vy,userid);
    //    })}
       
       
       const createtest = async()=>{
        const testdet = {
          username:'tarun',
          password:'tarun7'
        }

   const createtest = fetch('http://localhost:5001/createtest',{ method: 'post', headers: { "Content-Type": "application/json" }, body: JSON.stringify(testdet) })
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
