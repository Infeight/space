// import React from 'react'
// import { useRef,useEffect,useState } from 'react'
// import Chat from './chat'
// import './canvas.css'
// import socket from './socketfront'
// import { io } from 'socket.io-client'


// const Canvas = (props) => {

//   useEffect(()=>{
      
//   const canvasRef = useRef(null);
//   const canvas = canvasRef.current;
  
//   const ctx = canvas.getContext("2d");
//   },[])
  
//     const [frontEndUsers,setfrontEndUsers] = useState([]);
//     const [frontEnd, setFrontEnd] = useState({});
//     const [toid,setToid] = useState('');
//     const [toname,setToname] = ('');
//    const [position,setPosition] = useState({
//     x:0,
//     y:0
//    })

//     const userid = localStorage.getItem('current-id1');

//   //  const canvas = document.getElementById('canvas');

//    useEffect(()=>{
//                 socket.emit('updateUsers')
//    },[])



//   useEffect(() => {
//     socket.on("updateUsers1", (Users) => {
//       setFrontEnd((prevFrontEnd) => {
//         console.log("🔍 Previous frontEnd:", prevFrontEnd);
//         console.log("📥 Incoming Users:", Users);
  
//         const newFrontEnd = { ...prevFrontEnd };
  
//         for (const id in Users) {
//           const onlineUser = Users[id];
  
//           if (!(id in newFrontEnd)) {
//             newFrontEnd[id] = new Character(
//               onlineUser.x,
//               onlineUser.y,
//               0,
//               0,
//               onlineUser.curuserid,
//               onlineUser.color
//             );
//           } else {
//             newFrontEnd[id].x = onlineUser.x;
//             newFrontEnd[id].y = onlineUser.y;
//           }
//         }
  
//         for (const id in newFrontEnd) {
//           if (!Users[id]) {
//             delete newFrontEnd[id];
//           }
//         }
  
//         console.log("✅ Final frontEnd state:", newFrontEnd);
//         return newFrontEnd;
//       });
//     });
  
//     return () => {
//       socket.off("updateUsers1");
//     };
//   }, []);
  

          
        

//    const leave = ()=>{
//     delete frontEnd[socket.id]
//      socket.emit('removeUser',socket.id)
    
//    }
   
//    function Character(x,y,dx,dy,id,color){ 

//     const box = document.getElementById('testbox')
//     // box.innerHTML = ''
//  const boxdet = document.getElementById('testbox').getBoundingClientRect()

   
//    this.color = color;
//     this.x = x;
//     this.y = y; this.dx = dx; this.dy = dy;
//     this.id = id;

//     addEventListener('change',()=>{
//          console.log(this.x,this.y)
//     })

//     this.talk = chars =>{
//       for(const i in chars){
//         if(this === chars[i]) continue;

//         if(
//           this.x + 40 >= chars[i].x &&
//           this.x<= chars[i].x+ 40 &&
//           this.y+ 40 >= chars[i].y &&
//           this.y<= chars[i].y+40
//         ){
//           this.color = 'black'
//           chars[i].color = 'black'
//         }
//       }
//     }

//     this.draw = function(){
//       const curcanvas = canvas.current
//       // ctx = curcanvas.getContext('2d')
//      ctx.fillStyle = this.color;
//     //  ctx.clearRect(0,0,window.innerWidth,window.innerHeight)
//      ctx.fillRect(this.x+this.dx,this.y+this.dy,40,40)
//     }

//     }

// let vx=0; let vy=0;

 
//    window.addEventListener('keydown',(e)=>{

//    if(!frontEnd[socket.id]){return}

// switch(e.key){
//   case 'd': case 'D':
//     socket.emit('keydown', 'keyD');
//     break;
//   case 'a': case 'A':
//     socket.emit('keydown', 'keyA');
//     break;
//   case 's': case 'S':
//     socket.emit('keydown', 'keyS');
//     break;
//   case 'w': case 'W':
//     socket.emit('keydown', 'keyW');
//     break;
// }

  
//   })


//   let animationId;
//   function animate(){
// animationId = requestAnimationFrame(animate)
// ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

//  for(const id in frontEnd){
//      const user = frontEnd[id]
//      user.draw()
//     //  user.talk(frontEnd)
//  }


//   }
//   animate();

       
       
//        const createtest = async()=>{
//         const testdet = {
//           username:'tarun',
//           password:'tarun7'
//         }

//    const createtest = fetch('https://spaceserver-05iz.onrender.com/createtest',{ method: 'post', headers: { "Content-Type": "application/json" }, body: JSON.stringify(testdet) })
//        createtest.then(response=>response.json()).then((data)=>{
//        const useridcont = document.createElement('div')
//        useridcont.id = 'useridcont'
//        useridcont.className = 'useridcont'
//        useridcont.innerHTML = data.test._id
//         document.getElementById('testbox').appendChild(useridcont)
//        })
//   }

//   const handlechat = (e)=>{
//  const boxdet1 = document.getElementById('testbox').getBoundingClientRect()
//     ctx.clearRect(0,0,canvas.current.width,canvas.current.height)
    
//     setToid(e.target.closest('.testbox').querySelector('.useridcont').innerHTML)
//   }
  
//   // createtest();

//   const todet = {
//     toname:'Tarun',
//     toid:toid
//   }


//   return (

//     <div id='space_1'>
//     <canvas ref={canvas} width={1400} height={900} id='canvas' {...props}></canvas>
//     <div className='testbox' id='testbox'>
//     <button id='chat' style={{display:'none'}} onClick={handlechat}>Chat</button>
//     </div>
//      {
//      toid !=''? <Chat todet = {todet}/>: <></>
//      }

//      <button id='leave' onClick={leave}>Leave</button>
//     </div>
//   )
// }

// export default Canvas

import React, { useRef, useEffect, useState } from "react";
import Chat from "./chat";
import "./canvas.css";
import socket from "./socketfront";

const Canvas = (props) => {
  const canvasRef = useRef(null);
  const [frontEnd, setFrontEnd] = useState([]);
  const [toid, setToid] = useState("");
  const [ctx, setCtx] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setCtx(canvas.getContext("2d")); // ✅ Initialize ctx
  }, []);

  useEffect(() => {
    socket.emit("updateUsers");

    socket.on("updateUsers1", (Users) => {
      console.log("📥 Incoming Users:", Users);

      const usersArray = Object.values(Users).map(
        (user) => new Character(user.x, user.y, 0, 0, user.curuserid, user.color)
      );

      setFrontEnd(usersArray);
    });

    return () => {
      socket.off("updateUsers1");
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!socket.id) return;
      switch (e.key) {
        case "d": case "D": socket.emit("keydown", "keyD"); break;
        case "a": case "A": socket.emit("keydown", "keyA"); break;
        case "s": case "S": socket.emit("keydown", "keyS"); break;
        case "w": case "W": socket.emit("keydown", "keyW"); break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function Character(x, y, dx, dy, id, color) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.id = id;
    this.color = color;

    this.draw = function (ctx) {
      if (!ctx) return;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x + this.dx, this.y + this.dy, 40, 40);
    };
  }

  useEffect(() => {
    function animate() {
      if (!ctx) return;
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      for (const user of frontEnd) {
        user.draw(ctx);
      }
    }
    animate();
  }, [ctx, frontEnd]); // ✅ Re-run when ctx or frontEnd updates

  return (
    <div id="space_1">
      <canvas ref={canvasRef} width={1400} height={900} id="canvas" {...props}></canvas>
      <button id="leave" onClick={() => socket.emit("removeUser", socket.id)}>Leave</button>
    </div>
  );
};

export default Canvas;
