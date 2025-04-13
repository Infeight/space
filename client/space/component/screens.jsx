import React from 'react'
import '../component/screens.css'
import socket from "./socketfront";
import peer from '../component/peer.js'
import ReactPlayer from "react-player";
import { useAuth } from './authcontext.jsx';
import { useEffect,useState, useCallback } from 'react';


const Screens = () => {
  const { user } = useAuth();
const [remoteSocketId, setRemoteSocketId] = useState(null);
const [myStream, setMyStream] = useState();
const [remoteStream, setRemoteStream] = useState();




const handleCallUser = async()=>{
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      // sendStreams();
      const offer = await peer.getOffer();
      socket.emit("user:call", {  offer });
      setMyStream(stream);
}

const sendStreams = ()=>{

  if (!myStream) {
    console.error("Stream is not initialized yet.");
    return;
}
  peer.peer.getSenders().forEach(sender => peer.peer.removeTrack(sender));

  myStream.getTracks().forEach(track => {
      peer.peer.addTrack(track, myStream);
  });
}

const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer});
  }, [remoteSocketId, socket]);


  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream);
    });
  }, []);  

useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded])

useEffect(()=>{
    socket.on('joined-brain',(data)=>{
        console.log(JSON.parse(data))
        setRemoteSocketId(JSON.parse(data).id);
    })
    return () =>{ socket.off('joined-brain') }
})

useEffect(()=>{
    socket.on('incomming:call',async ({ from, offer }) => {
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMyStream(stream);
        console.log(`Incoming Call`, from, offer);
        const ans = await peer.getAnswer(offer);
        socket.emit("call:accepted", { ans });
      })
      return () =>{ socket.off('incomming:call') }
})

useEffect(()=>{
  socket.on('call:accepted',  ({ from, ans }) => {
    peer.setLocalDescription(ans);
    console.log("Call Accepted!");
    if (myStream) {
      sendStreams();
  }
    // sendStreams();
  })
  return () => { socket.off('call:accepted'); }
})

useEffect(()=>{
    socket.on('peer:nego:needed', async ({ from, offer }) => {
        const ans = await peer.getAnswer(offer);
        await peer.setLocalDescription(ans);
        socket.emit("peer:nego:done", {  ans });
      })
      return () =>{ socket.off('peer:nego:needed') }

})

useEffect(()=>{
    socket.on('peer:nego:final',async ({ ans }) => {
        await peer.setLocalDescription(ans);
      })
})



  return (
    <div className='screens'>
      videomeet
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {myStream && <button onClick={sendStreams}>Send Stream</button>}
      {remoteSocketId && <button onClick={handleCallUser} style={{height:'2vw'}}>Join video</button>}

      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={myStream}
          />
        </>
      )}

{remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={remoteStream}
          />
        </>
      )}
    </div>
  )
}

export default Screens
