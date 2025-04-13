import React, { useEffect, useRef } from "react";
import "./whiteboard.css";
import { useAuth } from './authcontext.jsx';
import socket from "./socketfront";

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);

  const { user } = useAuth();


  useEffect(() => {
    socket.on("draw", ({ x, y }) => {
      if (!ctxRef.current) return;
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();
    });

    return () => {
      socket.off("draw");
    };
  }, []);

  // Socket listener for mouse down
  useEffect(() => {
    socket.on("down", ({ x, y }) => {
      if (!ctxRef.current) return;
      ctxRef.current.moveTo(x, y);
    });

    return () => {
      socket.off("down");
    };
  }, []);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 1000;
    canvas.height = 700;

    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black"; 

    ctxRef.current = ctx;

    // Mouse Events
    const startDrawing = (e) => {
      isDrawing.current = true;
      const { offsetX, offsetY } = e;
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(offsetX, offsetY);
      socket.emit('down',{x:offsetX,y:offsetY});
    };

    const draw = (e) => {
      if (!isDrawing.current) return;
      
      const { offsetX, offsetY } = e;
      ctxRef.current.lineTo(offsetX, offsetY);
      ctxRef.current.stroke();
      socket.emit('draw',{x:offsetX,y:offsetY});
    };

    const stopDrawing = () => {
      isDrawing.current = false;
      ctxRef.current.closePath();
    };

    // Attach Events
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    // Cleanup Listeners on Unmount
    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
    };
  }, []);

  useEffect(()=>{
    socket.on('brainchat', (data) => {
      // document.getElementById('meetingdesk').style.display = 'flex'
      const showannouncement = document.createElement('div')
      const announcer = document.createElement('div')
      const announcedata = document.createElement('div')
      showannouncement.id = 'showannouncement'
      showannouncement.className = 'showannouncement'
      announcer.id = 'announcer'
      announcer.className = 'announcer'
      announcedata.className = 'announcedata'
      showannouncement.innerText = JSON.parse(data).msg
      announcer.innerText = JSON.parse(data).person
      announcedata.appendChild(showannouncement)
      announcedata.appendChild(announcer)
      document.getElementById('allbrainstormchats').appendChild(announcedata)
    })

    return () => { socket.off("brainchat"); };
  })

  const handleclose = ()=>{
    socket.emit('leave-brain');
  }

  const handlebrainchats = ()=>{
    let data = {
      msg: document.getElementById('brainstorm_matter').value,
      person: user.name
    }
    document.getElementById('brainstorm_matter').value = '';
    // document.getElementById('meetingdesk').style.display = 'flex'
    const showannouncement = document.createElement('div')
    const announcer = document.createElement('div')
    const announcedata = document.createElement('div')
    showannouncement.id = 'showannouncement'
    showannouncement.className = 'showannouncement'
    announcer.id = 'announcer'
    announcer.className = 'announcer'
    announcedata.className = 'announcedata-sent'
    showannouncement.innerText = data.msg
    announcer.innerText = data.person
    announcedata.appendChild(showannouncement)
    announcedata.appendChild(announcer)
    document.getElementById('allbrainstormchats').appendChild(announcedata)

    socket.emit('brainchat', JSON.stringify(data))
  }



  return (
    <>
    <div className="white">

    <div className="chats">
    <div className="brainstormchat" id="brainstormchat">
      <div className="btn-head-cont"> <div className="coffeehead">Brain Storm</div>
      
      <button id="closeboard" onClick={handleclose}>Close</button>
       </div>

        <div className="allbrainstormchats" id="allbrainstormchats"></div>

        <textarea type="text" id="brainstorm_matter" placeholder="Enter a message" />
      
          <button id="brainchatbtn" className="sendbtn" onClick={handlebrainchats}>Send</button>
       
      </div>
</div>

      <canvas ref={canvasRef} id="whiteboard"></canvas>
      
     
      </div>

    </>
  );
};

export default Whiteboard;

