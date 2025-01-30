
import React, { useRef, useEffect, useState } from "react";
import Chat from "./chat";
import "./canvas.css";
import socket from "./socketfront";

const Canvas = (props) => {
  const canvasRef = useRef(null);
  const [frontEnd, setFrontEnd] = useState([]);
  const [toid, setToid] = useState("");
  const [ctx, setCtx] = useState(null);
  const [todet,setTodet] = useState({
    name:"",
    toid:""
  });

  const currentuserid = localStorage.getItem('current-id1')
 

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setCtx(canvas.getContext("2d")); //  Initialize ctx
  }, []);

  useEffect(() => {
    socket.emit("updateUsers");

    socket.on("updateUsers1", (Users) => {
      // console.log("Incoming Users:", Users);

      const usersArray = Object.values(Users).map(
        (user) => new Character(user.x, user.y, 0, 0, user.curuserid, user.color, user.name)
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

  function Character(x, y, dx, dy, id, color, name) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.id = id;
    this.color = color;
    this.name = name

    this.draw = function (ctx) {
      if (!ctx) return;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x + this.dx, this.y + this.dy, 40, 40);
    };

  
  }

  useEffect(()=>{
       
  },[frontEnd])

  useEffect(() => {
    function animate() {
      if (!ctx) return;
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, 1400, 900);

      for (const user of frontEnd) {
        user.draw(ctx);
        chat();
      }
    }
    animate();
  }, [ctx, frontEnd]); 

  const chat = () => {
    let frontend1 = Array.from(frontEnd);
   let box1;
    frontEnd.map(val=> {

      if(val.id === currentuserid){
              box1 = val;
            frontend1 =   frontend1.filter(item=> item!== val);
      }
    })
   console.log(frontend1)
    for (const id1 in frontend1) {
      // for (const id2 in frontEnd) {
        // if (id1 === box1) {console.log('dcbscj');continue}; 

        // const box1 = frontEnd[id1];
        const box2 = frontend1[id1];

        if (
          box1.x < box2.x + 40 &&
          box1.x + 40 > box2.x &&
          box1.y < box2.y + 40 &&
          box1.y + 40 > box2.y
        ) {

            document.getElementById('chat').value = JSON.stringify({toid:box2.id, name:box2.name});
           document.getElementById('chat').style.display = 'block'
          }
        
           
          
        
        else{
           document.getElementById('chat').style.display = 'none'
        }
      }
    // }
  };

    const handlechat = (e)=>{
 console.log(JSON.parse(e.target.value))

   setTodet({name:JSON.parse(e.target.value).name, toid:JSON.parse(e.target.value).toid});
    }

    const closechat = ()=>{
      setTodet({name:"",toid:""})
    }
   
  return (
    <div id="space_1">
      <canvas ref={canvasRef} width={1400} height={900} id="canvas"></canvas>
      <button id="chat" onClick={handlechat} style={{display:'none'}}>chat</button>

    
   {  
    todet.toid!="" && <Chat todet={todet} />
  }
   <button id="closechat" onClick={closechat}>close</button>
  
   
      <button id="leave" onClick={() => socket.emit("removeUser", socket.id)}>Leave</button>
    </div>
  );
};

export default Canvas;
