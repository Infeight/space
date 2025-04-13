import React from 'react'
import { useRef, useState, useEffect } from 'react'
import './chat.css'
import socket from "./socketfront";
import { useAuth } from './authcontext.jsx';


import InputEmoji from "react-input-emoji";


import { io } from 'socket.io-client'

const Chat1 = (props) => {

  const { user } = useAuth();
  const scrollref = useRef();


  const [msg, setmsg] = useState({  //State to hold message  , updates each time msg is sent//
    caption: ""
  })

  const [currentmsg, setCurrentmsg] = useState({
    message: ""
  })
  const [allmsgs, setAllmsgs] = useState([]) //Stores all messages between from and to ids
  const [arrivemsg, setArrivemsg] = useState(null)  //if a message is recieved it sores that message and updates state to display it.//

  const setText = (e) => {     //sets message in state that is typed in input//
    setmsg({
      caption: e
    })
  }


  useEffect(() => {    // gets all messages related to from and to_id (mongodb) //
    handlegetmsgs()
  }, [props.todet.toid, allmsgs])

  const handlesend = () => {  //sends message and updates messages State hook with new message //

    const sendmsg = {
      from_id: user.id,
      toid: props.todet.toid,
      message: msg.caption
    }

    const msgs = [...allmsgs]
    msgs.push({ fromself: true, message: msg.caption })

    setAllmsgs(msgs)

    socket.emit('sendmsg', {
      to: props.todet.toid,
      from: user.id,
      message: msg.caption
    })

    fetch('http://localhost:5001/sendmsg', { method: 'post', headers: { "Content-Type": "application/json" }, body: JSON.stringify(sendmsg) })
    setCurrentmsg({ message: msg.caption })
    document.querySelector('.react-input-emoji--input').innerText = "";

  }

  const handlegetmsgs = async () => {  //gets messages between from and to ids from mongo//

    if (props.todet.toid) {
      const getmsg = {
        from_id: user.id,
        toid: props.todet.toid,

      }

      const response = await fetch('http://localhost:5001/getmsg', { method: 'post', headers: { "Content-Type": "application/json" }, body: JSON.stringify(getmsg) })
      const data = await response.json()
      console.log(data)
      setAllmsgs(data)
    }

  }


  useEffect(() => {  // if there is current active socket and a recievemsg is called then Arraive message State is updated//
    if (socket) {
      socket.on('recievemsg', (msg) => {
        setArrivemsg({ fromself: false, message: msg.message })
      })
    }
  }, [])

  useEffect(() => {  //if there is new msg arrived All messages state is updated with new msg added to it//
    arrivemsg && setAllmsgs((prev) => [...prev, arrivemsg])
  }, [arrivemsg])

  useEffect(() => {  //to scroll the page automatically if new msg arrives and is out of reading area//
    scrollref.current?.scrollIntoView({ behaviour: 'smooth' })
  }, [allmsgs])



  return (
    <>

      <div className="chatarea" id='chatarea'>

        <div className="allcontacts" id='allcontacts'></div>

        <div className="chathere" id='chathere'>
          <div className="chatheremob" id='chatheremob'></div>
          <div className='to_name' id='to_name'>{props.todet.name}

          </div>

          <div className="chatscont" id='chatscont'>
            <div className='scrollchat'>
              {console.log(allmsgs)}
              {allmsgs ? allmsgs.map((message) => {

                return (
                  <div>
                    <div className={`msg${message.fromself ? 'sent' : 'received'}`}>
                      <div className="content">
                        <p>
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              }) : <>bg</>}
            </div>
          </div>

          <div className='input-send-cont'>
            <InputEmoji

              onChange={setText}

              placeholder="Type a message"
            />

            <button className='send-btn' onClick={handlesend}> Send
            </button>
          </div>

        </div>

      </div>

    </>
  )
}

export default Chat1
