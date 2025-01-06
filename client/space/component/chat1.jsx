import React from 'react'
import './chat.css'
import { useEffect,useState,useRef } from 'react'
// import Navbar from './navbar'
import InputEmoji from "react-input-emoji";
// import { IoArrowBackSharp } from "react-icons/io5";
import {io} from 'socket.io-client'



const Chat = () => {
  const socket = useRef(null);
  const userid = localStorage.getItem('current-id1')
  const toid = localStorage.getItem('toid');

    const [msg,setmsg] = useState({
        caption:""
      })
   const [to_id,setTo_id] = useState({   // sets to_id according to required chat ends//
                    to_id:""
                  }) 
  
                  setTo_id({  to_id: toid })

    const[currentmsg,setCurrentmsg] = useState({
      message:""
    })
    const [allmsgs,setAllmsgs] = useState([])
    const [arrivemsg,setArrivemsg] = useState(null)

    const scrollref = useRef();

    const setText =(e)=>{
        setmsg({
        caption:e
        })
      }
   
 useEffect(()=>{
   if(userid){
    socket.current = io('http://localhost:5001')
    socket.current.emit('add-user',userid)
   }
 },[userid])     

// useEffect(()=>{
//     logins()
// },[])
useEffect(()=>{
   handlegetmsgs()
},[allmsgs,to_id])

const handlesend = ()=>{

  const sendmsg = {
    from_id: userid,
    toid: to_id.to_id,
    message:msg.caption
  }

  const msgs = [...allmsgs]
  msgs.push({fromself:true, message:msg.caption})

  setAllmsgs(msgs)

  socket.current.emit('sendmsg',{
    to: to_id.to_id,
    from: userid,
    message:msg.caption
  })

fetch('https://new-commune-3.onrender.com/sendmsg', { method: 'post', headers: { "Content-Type": "application/json" }, body: JSON.stringify(sendmsg) })
setCurrentmsg({message:msg.caption})
document.querySelector('.react-input-emoji--input').innerText="";

}

const handlegetmsgs = async()=>{

 if(to_id.to_id){
  const getmsg = {
    from_id: userid,
    toid: to_id.to_id,

  }
let obj;
    const response = fetch('https://new-commune-3.onrender.com/getmsg', { method: 'post', headers: { "Content-Type": "application/json" }, body: JSON.stringify(getmsg) })
    response.then(res => res.json())
  .then(data => {
    setAllmsgs(data)
   })
  
 }
  
}

useEffect(()=>{
  if(socket.current){
    socket.current.on('recievemsg',(msg)=>{
        setArrivemsg({fromself:false, message:msg})
    })
  }
},[])

useEffect(()=>{
  arrivemsg && setAllmsgs((prev)=>[...prev,arrivemsg])
},[arrivemsg])

useEffect(()=>{
   scrollref.current?.scrollIntoView({behaviour:'smooth'})
},[allmsgs])

const back = ()=>{
   document.getElementById('to_name').style.top = '-10vw'
   document.getElementById('chatheremob').style.background = `url('chat.gif')`
   document.getElementById('chatheremob').style.zIndex = `0`

   document.getElementById('chatheremob').style.backgroundSize ='60%'
   document.getElementById('chatheremob').style.backgroundRepeat='no-repeat'
   document.getElementById('chatheremob').style.backgroundPosition = 'center'
   document.getElementById('allcontacts').style.display = 'flex'


  document.querySelector('.input-send-cont').style.display = 'none'
  document.getElementById('chatscont').style.display = 'none'

}

// const handleto_id = (e)=>{

//   console.log(e.target.closest('.contacthold').querySelector('.contactname').innerText)
//    document.getElementById('toname').innerText = e.target.closest('.contacthold').querySelector('.contactname').innerText
//   // document.getElementById('chatscont').innerHTML = ""

//    const toid =e.target.closest('.contacthold').querySelector('.contactid').innerText

//    setTo_id({
//     to_id: toid
//    })
//    document.getElementById('chatscont').style.display = 'block'
//    document.getElementById('chatheremob').style.background = 'url()'
//    document.getElementById('chatheremob').style.zIndex = `-2`

//    document.querySelector('.input-send-cont').style.display = 'flex'
//    document.getElementById('to_name').style.top = '0vw'
//    document.getElementById('allcontacts').style.display = 'none'

//    document.getElementById('to_name').style.transitionDuration = '0.2s'
// }
// console.log(to_id.to_id)

//     const logins = async()=>{
//       let userdet = {
//         username: curuser,
//         userpass: curuserpass,
//         user_id : curuserid
//       }
//         const allusers1 =  fetch('https://new-commune-3.onrender.com/loginbyname',{method:'post',headers:{'Content-Type':'application/json'},body: JSON.stringify(userdet)})
//     //  const profilepics = await fetch('http://localhost:5004/profilepics',{headers:{accept:'application/json'}})
//     //  const profilepics1 = await profilepics.json()

//         // let allusers = await allusers1.json()
    
//     allusers1.then(response => response.json()).then(data=>{
//       // console.log(data)
//        data.logins.following.map(contact=>{
//         const contacthold = document.createElement('li')
//         const contactname = document.createElement('li')
//         const profilehold = document.createElement('img')
//         const contactid = document.createElement('li')

//         let profilearr = [
//           'dogg.jpg',
//           'donald.jpeg',
//           'doraemon.avif',
//           'Garfield.jpg',
//           'Jerry-Mouse.jpg',
//           'robo.jpeg',
//           // 'spiderman.jpg',
//           'spongebob.jpg',
//           'yellowone.webp'
// ]


//   profilehold.src = `${profilearr[Math.floor(Math.random() *8)]}`



//         contactid.className = 'contactid'
//         contacthold.className = 'contacthold'
//         profilehold.className = 'profilehold'
//         contactname.className = 'contactname'
//        contactid.style.display = 'none'
//        contactname.innerText = contact.name
//         contactid.innerText = contact.id
//         contacthold.addEventListener('click',handleto_id)
//         contacthold.append(profilehold)
//         contacthold.append(contactname)
//         contacthold.appendChild(contactid)
//        document.getElementById('allcontacts').appendChild(contacthold)
//        })
//     })

      



//     }
   
  return (
   <>
{/* <Navbar/> */}
<div className="chatarea">

<div className="allcontacts" id='allcontacts'></div>

<div className="chathere" id='chathere'>
  <div className="chatheremob" id='chatheremob'></div>
<div className='to_name' id='to_name'>
{/* <div className="backbtn" onClick={back}><IoArrowBackSharp /></div> */}
<div className="toname" id='toname'></div>
  </div>

    <div className="chatscont" id='chatscont'>

{allmsgs ? allmsgs.map((message)=>{
  return(
    <div>
      <div className={`msg${message.fromself? 'sent' : 'received'}`}>
        <div className="content">
          <p>
            {message.message}
          </p>
        </div>
      </div>
    </div>
  )
}):<>bg</>}

    </div>

    <div className='input-send-cont'>
    <InputEmoji 
       
       onChange={setText}
   
       placeholder="Type a message"
     />

     <button className='send-btn' onClick={handlesend}> <img style={{width:"100%"}} src="sendbtn.png" alt="" />
     </button>
    </div>
  
</div>

</div>
   </>
  )
}

export default Chat
