
import React, { useRef, useEffect, useState } from "react";
import Chat from "./chat";
import Screens from "./screens.jsx";
import Whiteboard from "./whiteboard.jsx";
import "./canvas.css";
import socket from "./socketfront";
import { useAuth } from './authcontext.jsx';
import Asiigntask from "./asiigntask.jsx";
import { Link } from 'react-router-dom';
import { PiChats } from "react-icons/pi";
import { TfiAnnouncement } from "react-icons/tfi";
import { IoImagesOutline } from "react-icons/io5";
import { CiCircleRemove } from "react-icons/ci";
import { BiCoffeeTogo } from "react-icons/bi";
import { IoBulbSharp } from "react-icons/io5";
import { MdAssignmentAdd } from "react-icons/md";
import { FaTasks } from "react-icons/fa";
import peer from '../component/peer.js'
import { io } from "socket.io-client";


const Canvas = (props) => {
  const canvasRef = useRef(null);
  const frontEnd = useRef([]);
  const [ctx, setCtx] = useState(null);
  const [joinedmeet, setJoinedmeet] = useState(false);
  const [video,setVideo] = useState(false);
  // const [video,setVideo] = useState(false);
  const [todet, setTodet] = useState({
    name: "",
    toid: ""
  });
  const [discussimg, setDiscussimg] = useState({
    file: null,
    url: ""
  });

  const[announceimg,setAnnounceimg] = useState({
    file:null,
    url:""
  })

  const[assign,setAssign] = useState(false);
  const instanceRef = useRef(false);

  const { user } = useAuth();

  // ctx initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setCtx(canvas.getContext("2d"));
  }, []);


  useEffect(()=>{
    socket.on('instance',()=>{
     document.getElementById("newinstance").style.display = 'flex'
     instanceRef.current = true;
    })
  })

  

  // Updates new users and their movements every 15 millisec
  useEffect(() => {
    socket.emit("updateUsers");
    socket.on("updateUsers1", (Users) => {
      frontEnd.current = Object.values(Users).map(
        (user) => new Character(user.x, user.y, 0, 0, user.curuserid, user.color, user.name, user.socketid, user.dp)
      );
    });
    return () => { socket.off("updateUsers1"); };
  }, []);

  // Notifies if someone wants to chat with you.
  useEffect(() => {
    socket.on('wantchat', (details) => {
      console.log(details)
      document.getElementById('confirmchat').style.display = 'flex'
      document.getElementById('chatmsg').innerText = `${details.fromname} wants to chat with you!`
      document.getElementById('chatyes').value = JSON.stringify(details)
      document.getElementById('chatno').value = JSON.stringify(details)
      setTimeout(() => {
        document.getElementById('confirmchat').style.display = 'none'
      }, 5000)
    })
    return () => { socket.off("wantchat"); };
  }, [])

  // Notifies if the person you want to chat accepted to chat back.
  useEffect(() => {
    socket.on('chatyes', (details) => {
      console.log(details)
      document.getElementById('confirmchat').style.display = 'flex'
      document.getElementById('chatmsg').innerText = `${JSON.parse(details).name} is online and wants to chat with you!`
      document.getElementById('btncont').style.display = 'none'
      setTimeout(() => {
        document.getElementById('confirmchat').style.display = 'none'
      }, 5000)
    })
    return () => { socket.off("chatyes"); };
  }, [])

  // Notifies if the person you want to chat declined to chat back.
  useEffect(() => {
    socket.on('chatno', (details) => {
      console.log(details)
      document.getElementById('confirmchat').style.display = 'flex'
      document.getElementById('chatmsg').innerText = `${JSON.parse(details).name}: I will chat Later.`
      document.getElementById('btncont').style.display = 'none'
      setTimeout(() => {
        document.getElementById('confirmchat').style.display = 'none'
      }, 5000)
    })
    return () => { socket.off("chatno"); };
  }, [])

  // Turns on meeting desk to display meeting chats.
  useEffect(() => {
    socket.on('announcement', (data) => {
      document.getElementById('meetingdesk').style.display = 'flex'
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
      document.getElementById('announcementdisp').appendChild(announcedata)
    })

    return () => { socket.off("announcement"); };
  })

  // Shows images sent in meeting chats.
  useEffect(() => {
    socket.on('discussimg', (data1) => {
      document.getElementById('meetingdesk').style.display = 'flex'

      const blob = new Blob([data1.body], { type: data1.type });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        const show_discussimg_img = document.createElement('img')
        const announcer = document.createElement('div')
        const announcedata = document.createElement('div')
        show_discussimg_img.id = 'show-discussimg-img'
        show_discussimg_img.className = 'show-discussimg-img'
        announcer.id = 'announcer'
        announcer.className = 'announcer'
        announcedata.className = 'announcedata'
        announcer.innerText = data1.person
        show_discussimg_img.src = reader.result
        announcedata.appendChild(show_discussimg_img)
        announcedata.appendChild(announcer)
        document.getElementById('announcementdisp').appendChild(announcedata);
      }
    })

    return () => { socket.off("discussimg"); };
  })


  // Movement handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!socket.id) return;
      console.log(instanceRef.current)
      if(instanceRef.current == true) return;
      switch (e.key) {
        case "d": case "D": socket.emit("keydown", "keyD"); break;
        case "a": case "A": socket.emit("keydown", "keyA"); break;
        case "s": case "S": socket.emit("keydown", "keyS"); break;
        case "w": case "W": socket.emit("keydown", "keyW"); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => { window.removeEventListener("keydown", handleKeyDown); };
  }, []);


  // Handles you joining a meeting room.
  useEffect(() => {
    socket.on('joined-meet', () => {
      document.getElementById('joinmeet').style.top = '-5vw'
      document.getElementById('joinedmeet').style.opacity = '1'

      setTimeout(() => {
        document.getElementById('joinedmeet').style.opacity = '0'
      }, 3000)

      document.getElementById('showannouncebtn').style.opacity = ' 100%'
      document.getElementById('showannouncebtn').style.zIndex = '2'
      document.getElementById('showannouncebtn').style.backgroundColor = 'rgb(133, 168, 214)'
      document.getElementById('showannouncebtn').style.boxShadow = '1px 1px 2px'

      setJoinedmeet(true)
      return () => { socket.off('joined-meet') }
    })
  })

  // Handles you leaving a meeting room.
  useEffect(() => {
    socket.on('left-meet', () => {
      document.getElementById('leavemeet').style.top = '-5vw'
      document.getElementById('leftmeet').style.opacity = '1'
      setTimeout(() => {
        document.getElementById('leftmeet').style.opacity = '0'
      }, 3000)
      document.getElementById('showannouncebtn').style.opacity = ' 60%'
      document.getElementById('showannouncebtn').style.zIndex = '-5'
      document.getElementById('showannouncebtn').style.boxShadow = 'none'
      document.getElementById('showannouncebtn').style.backgroundColor = 'white'

      setJoinedmeet(false);
      return () => { socket.off('left-meet') }
    })
  })

  // Handles announcement-all and displays announcement on screen
  useEffect(()=>{
    socket.on('announce_all_received',data=>{
      document.getElementById('announcementspanel').style.display = 'flex'
      const showannouncement = document.createElement('div')
      const announcer = document.createElement('div')
      const announcedata = document.createElement('div')
      showannouncement.id = 'showannouncement'
      showannouncement.className = 'showannouncement'
      announcer.id = 'announcer'
      announcer.className = 'announcer'
      announcedata.className = 'announcedata'
      showannouncement.innerText = '🖇️'+JSON.parse(data).msg
      announcer.innerText = JSON.parse(data).person
      announcedata.appendChild(showannouncement)
      announcedata.appendChild(announcer)
      document.getElementById('allannouncements').appendChild(announcedata)
    })

    return () => { socket.off("announce_all_received"); };
  })

  
  // handles images sent in announcement all

  useEffect(() => {
    socket.on('announceimg', (data1) => {
      document.getElementById('announcementspanel').style.display = 'flex'

      const blob = new Blob([data1.body], { type: data1.type });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        const show_discussimg_img = document.createElement('img')
        const announcer = document.createElement('div')
        const announcedata = document.createElement('div')
        show_discussimg_img.id = 'show-discussimg-img'
        show_discussimg_img.className = 'show-discussimg-img'
        announcer.id = 'announcer'
        announcer.className = 'announcer'
        announcedata.className = 'announcedata'
        announcer.innerText = data1.person
        show_discussimg_img.src = reader.result
        announcedata.appendChild(show_discussimg_img)
        announcedata.appendChild(announcer)
        document.getElementById('allannouncements').appendChild(announcedata);
      }
    })

    return () => { socket.off("announceimg"); };
  })


  // handles joining coffeeroom chats
  useEffect(()=>{
    socket.on('joined-coffee',()=>{
         document.getElementById('joinedcoffee').style.opacity = '1'
         
    })
    return () => { socket.off("joined-coffee"); };
  })

  //Handles leaving coffeeroom chats

  useEffect(()=>{
    socket.on('left-coffee',()=>{
     document.getElementById('joinedcoffee').style.opacity = '0'
      document.querySelector('.coffeeroomchat').classList.remove('open')
        
    })
    return () => { socket.off("left-coffee"); };
  })

  //joined-white-board
  useEffect(()=>{
    socket.on('joined-brain',(data)=>{
         document.getElementById('joinedbrain').style.opacity = '1'
    })
  return()=>{
    socket.off('joined-brain');
  }
  })
 
  //left-White-board
  useEffect(()=>{
    socket.on('left-brain',(data)=>{
         document.getElementById('joinedbrain').style.opacity = '0'
         setVideo(false);
    })
  return()=>{
    socket.off('joined-brain');
  }
  })

  useEffect(()=>{
    socket.on('taskassigned',()=>{
       document.getElementById('newtask').style.top = '1vw'
       setTimeout(()=>{
          document.getElementById('newtask').style.top = '-5vw'
       },3000)
    })
  return()=>{
    socket.off('joined-brain');
  }
  })
  

  //<== !!!!! WEB RTC CODE !!!!! ==>//

    



  //<== !!!!! WEB RTC CODE ENDS !!!!! ==>//



  useEffect(()=>{
    socket.on('coffeechat', (data) => {
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
      document.getElementById('allcoffeechats').appendChild(announcedata)
    })

    return () => { socket.off("coffeechat"); };
  })

  // Character function
  function Character(x, y, dx, dy, id, color, name, socketid, dp) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.id = id;
    this.color = color;
    this.name = name
    this.socketid = socketid
    this.dp = dp

    this.draw = function (ctx, user) {
      if (!ctx) {
        console.error("Canvas context is not provided.");
        return;
      }
    
      const img = new Image();
      img.src = user.dp;
    
      img.onload = () => {
        requestAnimationFrame(() => {
          ctx.fillStyle = this.color || "black";
          ctx.strokeRect(this.x, this.y, 40, 40);
          ctx.drawImage(img, this.x+1, this.y+1, 38, 38);

          ctx.fillStyle = "black"; // Text color
    ctx.font = "16px Arial"; // Font style
    ctx.textAlign = "center"; // Center text
    ctx.fillText(this.name, this.x + 20, this.y - 10);
        });
      };
      
    
      img.onerror = () => {
        console.error("Failed to load image:", img.src);
      };
    };
  
    
  }

  // positions of poster block;;
  const manager = { x: 800, y: 100, width: 200, height: 200, color: '#1F2F43' }
  const employees = { x: 50, y: 400, width: 600, height: 400, color: '#1F2F43' }
  const meetingroom = { x: 50, y: 100, width: 500, height: 250, color: '#1F2F43' }
  const announceroom = { x: 1100, y: 100, width: 200, height: 200, color: '#1F2F43' }
  const coffeeroom = {x: 1100, y: 400, width: 200, height: 200, color: '#1F2F43'}
  const brainstorm = {x:800, y:400, width:200,height:200,color:'#1F2F43'}

  // Animation calling od all the blocks to appear on canvas
  useEffect(() => {
    let animationFrameId;
    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, 1400, 900);

      // manager block
        ctx.strokeStyle = manager.color
      ctx.strokeRect(manager.x, manager.y, manager.width, manager.height)
      ctx.drawImage(imgs[4],manager.x, manager.y, 200, 200);

      //Employees block
      ctx.strokeStyle = employees.color
      ctx.strokeRect(employees.x, employees.y, employees.width, employees.height)
      ctx.drawImage(imgs[5],employees.x+100, employees.y+50, 400, 300);

      //meeting room
      ctx.strokeStyle = meetingroom.color
      ctx.strokeRect(meetingroom.x, meetingroom.y, meetingroom.width, meetingroom.height)
      ctx.drawImage(imgs[1], meetingroom.x+100, meetingroom.y+25, 300, 200);

      // Announcement to all block
      ctx.strokeStyle = announceroom.color
      ctx.strokeRect(announceroom.x, announceroom.y, announceroom.width, announceroom.height)
      ctx.drawImage(imgs[2],announceroom.x+25, announceroom.y+25, 150, 150);

      // Coffeeroom
      ctx.strokeStyle = coffeeroom.color
      ctx.strokeRect(coffeeroom.x, coffeeroom.y, coffeeroom.width, coffeeroom.height)
      ctx.drawImage(imgs[0], coffeeroom.x+25, coffeeroom.y+25, 150, 150);

      //BrainStorm room
      ctx.strokeStyle = brainstorm.color
      ctx.strokeRect(brainstorm.x, brainstorm.y, brainstorm.width, brainstorm.height)
      ctx.drawImage(imgs[3],brainstorm.x+25, brainstorm.y+25, 150, 150);

      for (const user of frontEnd.current) {
        user.draw(ctx,user);
        chat();
        meeting();
      }
      animationFrameId = requestAnimationFrame(animate);
    }


    const imgsource = [
      'coffeechats.jpg',
      'meeting.png',
      'announcements.jpg',
      'brainstorm.jpg',
      'manager.jpg',
      'employees.jpg'
    ];
    
    const imgs = [];
    let loadedImages = 0;
    
    imgsource.forEach((src, index) => {
      const img = new Image();
      img.src = src;
    
      img.onload = function () {
        imgs[index] = img;
        loadedImages++;
    
        // Start animation only when all images are loaded
        if (loadedImages === imgsource.length) {
          animate();
        }
      };
    });
    

    return () => { cancelAnimationFrame(animationFrameId); };
  }, [ctx, frontEnd.current]);

  // Handles entering a meeting room or leaving it.
  const meeting = () => {
    let box1;
    frontEnd.current.map(val => { if (val.id === user.id) { box1 = val; } })

      // Meeting room collision code
    if (
      box1.x < meetingroom.x + meetingroom.width &&
      box1.x + 40 > meetingroom.x &&
      box1.y < meetingroom.y + meetingroom.height &&
      box1.y + 40 > meetingroom.y) {
      if (joinedmeet == false) { document.getElementById('joinmeet').style.top = '1vw' }
      document.getElementById('leavemeet').style.top = '-5vw'
    }

    else {
      if (joinedmeet == true) { document.getElementById('leavemeet').style.top = '1vw' }
      document.getElementById('joinmeet').style.top = '-5vw'
    }

     // Announcement room collision code
      if( 
       box1.x < announceroom.x + announceroom.width &&
       box1.x + 40 > announceroom.x &&
       box1.y < announceroom.y + announceroom.height &&
       box1.y + 40 > announceroom.y)
       {
        document.getElementById('showposterbtn').style.opacity = '100%'
        document.getElementById('showposterbtn').style.zIndex = '2'
        document.getElementById('showposterbtn').style.backgroundColor = '#85A8D6  '
        // document.getElementById('showposterbtn').getElementsByTagName('svg').style.color = 'white'
         document.getElementById('showposterbtn').style.boxShadow = '1px 1px 2px'     
     }
     else{
      document.getElementById('showposterbtn').style.opacity = '60%'
        document.getElementById('showposterbtn').style.zIndex = '-5'
       document.getElementById('showposterbtn').style.boxShadow = 'none'
           document.getElementById('showposterbtn').style.backgroundColor = 'white'
           document.querySelector('.announceall').classList.remove('open')
     }

     //coffeerrom collision
   
     if( 
      box1.x < coffeeroom.x + coffeeroom.width &&
      box1.x + 40 > coffeeroom.x &&
      box1.y < coffeeroom.y + coffeeroom.height &&
      box1.y + 40 > coffeeroom.y)
      {
       document.getElementById('coffeeroombtn').style.opacity = '100%'
       document.getElementById('coffeeroombtn').style.zIndex = '2'
       document.getElementById('coffeeroombtn').style.backgroundColor = '#85A8D6 '
        document.getElementById('coffeeroombtn').style.boxShadow = '1px 1px 2px'     
    }
    else{
     document.getElementById('coffeeroombtn').style.opacity = '60%'
       document.getElementById('coffeeroombtn').style.zIndex = '-5'
      document.getElementById('coffeeroombtn').style.boxShadow = 'none'
          document.getElementById('coffeeroombtn').style.backgroundColor = 'white'
          socket.emit('leavecoffee');
    }

    //Brainstorm collision
    if( 
      box1.x < brainstorm.x + brainstorm.width &&
      box1.x + 40 > brainstorm.x &&
      box1.y < brainstorm.y + brainstorm.height &&
      box1.y + 40 > brainstorm.y)
      {
       document.getElementById('brainstormbtn').style.opacity = '100%'
       document.getElementById('brainstormbtn').style.zIndex = '2'
       document.getElementById('brainstormbtn').style.backgroundColor = '#85A8D6 '
        document.getElementById('brainstormbtn').style.boxShadow = '1px 1px 2px'     
    }
    else{
     document.getElementById('brainstormbtn').style.opacity = '60%'
       document.getElementById('brainstormbtn').style.zIndex = '-5'
      document.getElementById('brainstormbtn').style.boxShadow = 'none'
          document.getElementById('brainstormbtn').style.backgroundColor = 'white'
          // socket.emit('leavecoffee');
    }

  }

  //Handles chat when two characters meet or overlap
  const chat = () => {
    let frontend1 = Array.from(frontEnd.current);
    let box1;
    frontEnd.current.map(val => {
      if (val.id === user.id) {
        box1 = val;
        frontend1 = frontend1.filter(item => item !== val);
      }
    })


    for (const id1 in frontend1) {
      const box2 = frontend1[id1];

      if (box1.x < box2.x + 40 && box1.x + 40 > box2.x && box1.y < box2.y + 40 && box1.y + 40 > box2.y) {
        let todetails = {
          toid: box2.id,
          socketid: box2.socketid,
          name: box2.name,
        }
        document.getElementById('chat').value = JSON.stringify(todetails);
        document.getElementById('chat').style.opacity = '100%'
        document.getElementById('chat').style.zIndex = '2'
        document.getElementById('chat').style.backgroundColor = '#85A8D6  '
        document.getElementById('chat').style.boxShadow = '1px 1px 2px'
      }

      else {
        document.getElementById('chat').style.opacity = '60%'
        document.getElementById('chat').style.zIndex = '-5'
        document.getElementById('chat').style.backgroundColor = 'white'
        document.getElementById('chat').style.boxShadow = 'none'
      }
    }
  };

 

  // });
   
  // handles chat one on one
  const handlechat = (e) => {
    console.log(e.target)
    let confirmchatdet = {
      toname: JSON.parse(e.target.value).name,
      toid: JSON.parse(e.target.value).toid,
      socketid: JSON.parse(e.target.value).socketid,
      fromsocketid: socket.id,
      fromname: user.name,
      fromid: user.id
    }
    socket.emit('wantchat', JSON.stringify(confirmchatdet))
    setTodet({ name: JSON.parse(e.target.value).name, toid: JSON.parse(e.target.value).toid });
    document.getElementById('closechat').style.backgroundColor = 'red'
    document.getElementById('closechat').style.opacity = '100%'
    document.getElementById('closechat').style.boxShadow = '1px 1px 2px'
    document.getElementById('closechat').style.zIndex = '2'
  }

  // Closes one on one chat window by setting To details to ""
  const closechat = () => {
    setTodet({ name: "", toid: "" })
    document.getElementById('closechat').style.backgroundColor = 'white'
    document.getElementById('closechat').style.opacity = '60%'
    document.getElementById('closechat').style.boxShadow = 'none'
    document.getElementById('closechat').style.zIndex = '-5'
  }

  //  Handles Accepting one on one chat request by others
  const handleconfirmchat = (e) => {
    console.log(JSON.parse(e.target.value))
    setTodet({ name: JSON.parse(e.target.value).fromname, toid: JSON.parse(e.target.value).fromid })
    let chatyesdet = {
      name: JSON.parse(e.target.value).toname,
      socketid: JSON.parse(e.target.value).fromsocketid
    }
    socket.emit('chatyes', JSON.stringify(chatyesdet))
    document.getElementById('confirmchat').style.display = 'none'
    document.getElementById('closechat').style.backgroundColor = 'red'
    document.getElementById('closechat').style.opacity = '100%'
    document.getElementById('closechat').style.boxShadow = '1px 1px 2px'
    document.getElementById('closechat').style.zIndex = '2'
  }

  //  Handles Declining one on one chat request by others
  const handledeclinechat = (e) => {
    setTodet({ name: "", toid: "" })
    let chatnodet = {
      name: JSON.parse(e.target.value).toname,
      socketid: JSON.parse(e.target.value).fromsocketid
    }
    socket.emit('chatno', JSON.stringify(chatnodet))
    document.getElementById('confirmchat').style.display = 'none'
  }

  // Handles sending messages to all people in the meeting room.
  const handleannouncement = () => {
    let data = {
      msg: document.getElementById('announcematter').value,
      person: user.name
    }
    document.getElementById('announcematter').value = '';
    document.getElementById('meetingdesk').style.display = 'flex'
    const showannouncement = document.createElement('div')
    const announcer = document.createElement('div')
    const announcedata = document.createElement('div')
    showannouncement.id = 'showannouncement'
    showannouncement.className = 'showannouncement'
    announcer.id = 'announcer'
    announcer.className = 'announcer'
    announcedata.className = 'announcedata-sent'
    showannouncement.innerText = '🖇️'+ data.msg
    announcer.innerText = data.person
    announcedata.appendChild(showannouncement)
    announcedata.appendChild(announcer)
    document.getElementById('announcementdisp').appendChild(announcedata)

    socket.emit('announcement', JSON.stringify(data))
  }

  // Handles displaying the image selected before sending in the meeting.
  const handleimg = async (e) => {
    document.getElementById('removeimg').style.display = 'flex'
    document.getElementById('discussimg-img').style.display = 'flex'
    setDiscussimg({ ...discussimg, file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]) })
  }

  // Handles Removal of the image selected to send in the meeting.
  const handleremoveimg = () => {
    document.getElementById('discussimg-img').style.display = 'none'
    setDiscussimg({ ...discussimg, file: null, url: "" })
    document.getElementById('removeimg').style.display = 'none'
  }

  // Handles Sending the image selected in the meeting.
  const handlesendimg = async (e) => {
    const msgobject = {
      type: 'file',
      body: discussimg.file,
      mimeType: discussimg.file.type,
      person: user.name
    }
    document.getElementById('discussimg-img').style.display = 'none'
    setDiscussimg({ ...discussimg, file: null, url: "" })
    document.getElementById('removeimg').style.display = 'none'
    document.getElementById('meetingdesk').style.display = 'flex'
    const blob = new Blob([msgobject.body], { type: msgobject.type });
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      const show_discussimg_img = document.createElement('img')
      const announcer = document.createElement('div')
      const announcedata = document.createElement('div')
      show_discussimg_img.id = 'show-discussimg-img'
      show_discussimg_img.className = 'show-discussimg-img'
      announcer.id = 'announcer'
      announcer.className = 'announcer'
      announcedata.className = 'announcedata-sent'
      announcer.innerText = msgobject.person
      show_discussimg_img.src = reader.result
      announcedata.appendChild(show_discussimg_img)
      announcedata.appendChild(announcer)
      document.getElementById('announcementdisp').appendChild(announcedata);
    }
    socket.emit('discussimg', msgobject)
  }

  // Calls the handleannouncement and handlesendimg functions at the same time if send is clicked.
  const handlemeetingmsg = () => {
    handleannouncement();
    handlesendimg();
  }

  // Handles displaying Send panel in the meeting room
  const handleannouncebtn = () => {
    // document.getElementById('showannouncebtn').style.backgroundColor = 'red'
    document.querySelector('.announcement').classList.toggle('open')
    document.getElementById('announcement').style.display = 'flex'
  }

  const handleposter = ()=>{
    // document.getElementById('showposterbtn').style.backgroundColor = 'red'
    document.querySelector('.announceall').classList.toggle('open')
  }

  // Handles your Joining of the meeting room.
  const handlejoinmeet = () => {
    document.getElementById('joinmeet').style.top = '-5vw'
    socket.emit('joinmeet');
  }
  // Handles your Leaving of the meeting room.
  const handleleavmeet = () => {
    document.getElementById('leavemeet').style.top = '-5vw'
    document.querySelector('.announcement').classList.remove('open')
    socket.emit('leavemeet');
  }

  // Handles closing of the Meeting Desk.
  const closemeeting = () => {
    document.getElementById('meetingdesk').style.display = 'none'
  }

  //Handles announce all event
  const handleannounceall= ()=>{
    let data = {
      msg: document.getElementById('announce_all_matter').value,
      person: user.name
    }

    document.getElementById('announcementspanel').style.display = 'flex'
    const showannouncement = document.createElement('div')
    const announcer = document.createElement('div')
    const announcedata = document.createElement('div')
    showannouncement.id = 'showannouncement'
    showannouncement.className = 'showannouncement'
    announcer.id = 'announcer'
    announcer.className = 'announcer'
    announcedata.className = 'announcedata'
    showannouncement.innerText = data.msg
    announcer.innerText = data.person
    announcedata.appendChild(showannouncement)
    announcedata.appendChild(announcer)
    document.getElementById('allannouncements').appendChild(announcedata)

    document.getElementById('announce_all_matter').value = '';
    socket.emit('announce_all', JSON.stringify(data))
  }

  const closeannouncements = () => {
    document.getElementById('announcementspanel').style.display = 'none'
  }

  //handles announce img sending

  const handleannounceimg = async (e) => {
    const msgobject = {
      type: 'file',
      body: announceimg.file,
      mimeType: announceimg.file.type,
      person: user.name
    }
    document.getElementById('announce-img').style.display = 'none'
    setAnnounceimg({ ...announceimg, file: null, url: "" })
    document.getElementById('removeannounceimg').style.display = 'none'
    document.getElementById('announcementspanel').style.display = 'flex'
    const blob = new Blob([msgobject.body], { type: msgobject.type });
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      const show_discussimg_img = document.createElement('img')
      const announcer = document.createElement('div')
      const announcedata = document.createElement('div')
      show_discussimg_img.id = 'show-discussimg-img'
      show_discussimg_img.className = 'show-discussimg-img'
      announcer.id = 'announcer'
      announcer.className = 'announcer'
      announcedata.className = 'announcedata-sent'
      announcer.innerText = msgobject.person
      show_discussimg_img.src = reader.result
      announcedata.appendChild(show_discussimg_img)
      announcedata.appendChild(announcer)
      document.getElementById('allannouncements').appendChild(announcedata);
    }
    socket.emit('announceimg', msgobject)
  }

  const handleannoncepreimg = async (e) => {
    document.getElementById('removeannounceimg').style.display = 'flex'
    document.getElementById('announce-img').style.display = 'flex'
    setAnnounceimg({ ...discussimg, file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]) })
  }

  // Handles Removal of the image selected to send in the meeting.
  const handleremoveannoncepreimg = () => {
    document.getElementById('announce-img').style.display = 'none'
    setAnnounceimg({ ...discussimg, file: null, url: "" })
    document.getElementById('removeannounceimg').style.display = 'none'
  }

  //sends announcements all msg plus img

  const handleallannouncement_send = ()=>{
    handleannounceall();
    handleannounceimg();
  }

  //handles adding you to coffeechats
  const handleCoffee = ()=>{
    document.getElementById('coffeeroombtn').style.backgroundColor = 'red'
    document.querySelector('.coffeeroomchat').classList.toggle('open')
    socket.emit('joincoffee');
  }
  //handles coffeechats sending
  const handlecoffeechats = ()=>{
    let data = {
      msg: document.getElementById('coffeechat_matter').value,
      person: user.name
    }
    document.getElementById('coffeechat_matter').value = '';
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
    document.getElementById('allcoffeechats').appendChild(announcedata)

    socket.emit('coffeechat', JSON.stringify(data))
  }

  const handleScreens = ()=>{
    let data = {
     id:user.id,
      person: user.name
    }
    socket.emit('joinbrainstorm', JSON.stringify(data))
    setVideo(true);
    
  }

  const handletasks = async(e)=>{
    if(e.target.value =='close'){
      document.getElementById('taskdisplay').style.display = 'block'
    document.getElementById('taskdisplay').innerHTML=' <h4>Tasks</h4>'
    const data = {userid:user.id}
    const alllogin = fetch('http://localhost:5001/gettask',{ method: 'post', headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })

    alllogin.then(response=>response.json()).then(data=>{
    
       data.map(task=>{

           if(!task.task.finished){
            const taskcont = document.createElement('div')
            const taskname = document.createElement('div')
            const deadline = document.createElement('div')
            const taskid = document.createElement('div')
            const completed = document.createElement('button')
            completed.innerText = '✅'
            taskname.className = 'taskname'
            deadline.className = 'deadline'
            completed.className = 'completed'
            taskid.className = 'taskid'
            taskid.innerText = task.task._id
            taskname.innerText = task.task.task
            deadline.innerText = task.task.deadline
            completed.addEventListener('click', hadlestriketask)
  
            taskcont.className = 'taskcontainer'
            
            taskcont.appendChild(taskname)
            taskcont.appendChild(deadline)
            taskcont.appendChild(taskid)
            taskcont.appendChild(completed)
  
            document.getElementById('taskdisplay').appendChild(taskcont)
           }
  
       }) 
    })
  e.target.value = 'open'
  }
  else{
    document.getElementById('taskdisplay').style.display = 'none'
      e.target.value = 'close'
  }
  }

  const hadlestriketask = async(e)=>{

    const data = {
      taskid : e.target.closest('.taskcontainer').querySelector('.taskid').innerText,
    }
    console.log(data)

    e.target.closest('.taskcontainer').style.backgroundColor = '#c4ffc4'
    e.target.closest('.taskcontainer').removeChild(e.target)

 await fetch('http://localhost:5001/taskdone',{ method: 'post', headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });

  
}

  const handleassigntasks = (e)=>{
    if(e.target.value =='close'){
      e.target.value = 'open'
      e.target.closest('#assigntasks').style.backgroundColor = 'red'
     setAssign(true)
     
    }
    else{
      e.target.value = 'close'
      e.target.closest('#assigntasks').style.backgroundColor = '#85A8D6 '
      setAssign(false)
    } 
  }

  const handleleave =()=>{
 
    socket.emit("removeUser", socket.id)
  } 

  const handleassignedtasks = async()=>{
     document.getElementById('allassignedtasks').style.display = 'block'
    try{
      document.getElementById('assignedtasksdisp').innerHTML = ''
      const alltasks = await fetch('http://localhost:5001/alltasks',{headers:{accept:'application/json'}})
  
     const alltasks1 = await alltasks.json();
     alltasks1.map(task=>{
      const taskcont = document.createElement('div')
      const taskname = document.createElement('div')
      const assigedname = document.createElement('div')

      taskcont.className = 'taskcont-show'
      taskname.className = 'taskname-show'
      assigedname.className = 'assignedname'

      if(task.finished==true){
        taskcont.style.backgroundColor = '#c4ffc4'
      }

      taskname .innerText = task.task
      assigedname.innerText= 'Assigned:'+ ' '+ task.assignedname

      taskcont.appendChild(taskname)
      taskcont.appendChild(assigedname)

      document.getElementById('assignedtasksdisp').appendChild(taskcont)

     })
     }

     catch(e){
        console.log('could not fetch')
     }
  }

  const closeallassigned = ()=>{
    document.getElementById('allassignedtasks').style.display = 'none'
  }


  return (
    
    <div id="space_1">
      <canvas ref={canvasRef} width={1400} height={900} id="canvas"></canvas>

      {todet.toid != "" && <Chat todet={todet} />}

      {video==true && <Whiteboard/>}
      {assign==true && <Asiigntask/>}

      <div className="nophone" id='nophone'>

      💻✨ Optimized for Desktop <br /> <br />

      🚫📱 Mobile & Tablet Access Limited <br /> <br />

This workspace is specially designed for laptops and desktop computers 💼🖥️

For the best experience — including full canvas features, meetings, and team interactions — please switch to a larger screen.

Thanks for understanding! 💙
  </div>
      

      <div className="joinedmeet" id="joinedbrain">You joined the Brainstorm room.</div>
      <div className="joinedmeet" id="leftbrain">You left the brainstorm room.</div>

      

      <Link to={'/'}><button id="leave" onClick={handleleave}>Leave</button></Link>
      <button id="assignedtasks" style={{display: user.role=='Manager'? 'block': 'none', zIndex:'10', position:'relative'}} onClick={handleassignedtasks}>Assigned tasks</button>
      

      <div className="allassignedtasks" id="allassignedtasks">

      <div className="assign-task-head">
          <div className="Assignedtaskhead">Assigned tasks</div>
          <button className="closemeet" onClick={closeallassigned}>close</button>
        </div>

         <div className="assignedtasksdisp" id="assignedtasksdisp">

         </div>
      </div>



      <div className="joinmeet" id="joinmeet">
        <p>Join the meeting room! <br /> This will make you a part of the meeting.</p>
        <button onClick={handlejoinmeet}>Join</button>
      </div>

      <div className="joinmeet" id="leavemeet">
        <p>Leave the meeting room! <br /> This will remove you from the meeting.</p>
        <button onClick={handleleavmeet}>Leave</button>
      </div>

      <div className="joinedmeet" id="joinedmeet">You joined the meeting room.</div>
      <div className="joinedmeet" id="leftmeet">You left the meeting room.</div>

      <div className="confirmchat" id="confirmchat">
        <div className="chatmsg" id="chatmsg"></div>
        <div className="btncont" id="btncont">
          <button id="chatyes" onClick={handleconfirmchat}>Yes</button>
          <button id="chatno" onClick={handledeclinechat}>No</button>
        </div>
      </div>

      <div className="announcement" id="announcement">
        <textarea type="text" id="announcematter" placeholder="Enter a message" />
        <input type="file" name="posterimg" id="posterimg" style={{ display: 'none' }} onChange={handleimg} placeholder="Select an image to poster" />

        <img id="discussimg-img" src={discussimg.url} alt="" />
        <div className="announcebtnhold">
          <label htmlFor="posterimg" className="posterimglabel"> <IoImagesOutline /> </label>
          <button className="removeimg" id="removeimg" onClick={handleremoveimg}><CiCircleRemove /></button>
          <button id="announcebtn" className="sendbtn" onClick={handlemeetingmsg}>Announce</button>
        </div>
      </div>

      <div className="meetingdesk" id="meetingdesk">
        <div className="btn-head-cont">
          <div className="meetinghead">Meeting Desk</div>
          <button className="closemeet" onClick={closemeeting}>close</button>
        </div>
        <div className="announcementdisp" id="announcementdisp"></div>
      </div>

      <div className="announceall" id="announceall">
        <textarea type="text" id="announce_all_matter" placeholder="Enter a message" />
        <input type="file" name="announceimg" id="announceimg" style={{ display: 'none' }} onChange={handleannoncepreimg} placeholder="Select an image to poster" />

        <img id="announce-img" src={announceimg.url} alt="" />
        <div className="announcebtnhold">
        <label htmlFor="announceimg" className="posterimglabel"> <IoImagesOutline /> </label>
        <button className="removeimg" id="removeannounceimg" onClick={handleremoveannoncepreimg}><CiCircleRemove /></button>
          <button id="announce_allbtn" className="sendbtn" onClick={handleallannouncement_send}>Announce</button>
        </div>
      </div>

      <div className="announcementspanel" id="announcementspanel">
      <div className="btn-head-cont">
          <div className="meetinghead">Announcements</div>
          <button className="closemeet" onClick={closeannouncements}>close</button>
        </div>
        <div className="allannouncements" id="allannouncements"></div>
      </div>

       
      <div className="joinedmeet" id="joinedcoffee">You joined the coffee room.</div>
      <div className="joinedmeet" id="leftcoffee">You left the coffee room.</div>
      <div className="coffeeroomchat" id="coffeeroomchat">

      <div className="coffeechatpanel" id="coffeechatpanel">
      <div className="btn-head-cont">
          <div className="coffeehead">Coffee chats</div>
        </div>
        <div className="allcoffeechats" id="allcoffeechats"></div>
      </div>

        <textarea type="text" id="coffeechat_matter" placeholder="Enter a message" />
      
        <div className="announcebtnhold">
         
          <button id="coffeechatbtn" className="sendbtn" onClick={handlecoffeechats}>Send</button>
        </div>
      </div>

     <div className="joinmeet" id="newtask">New task has been assigned to you!</div>
      
      <div className="taskdisplay" id="taskdisplay">
        <h4>Tasks</h4>
      </div>

    
      <div className="chat-post-btns">
        {
      user.role!='Manager' &&  <button id="showtasks" value={'close'} style={{opacity:'100%',zIndex:'2',backgroundColor:'#85A8D6 ',boxShadow:'1px 1px 2px'}} onClick={handletasks}><FaTasks /></button>
        }
        {
          user.role=='Manager' && <button id="assigntasks" value={'close'} style={{opacity:'100%',zIndex:'2',backgroundColor:'#85A8D6 ',boxShadow:'1px 1px 2px'}} onClick={handleassigntasks}><MdAssignmentAdd /></button>
        }
        <button id="closechat" onClick={closechat}>close</button>
        <button id="chat" onClick={handlechat} >chat</button>
        <button id="showannouncebtn" onClick={handleannouncebtn}><TfiAnnouncement /></button>
        <button id="showposterbtn" onClick={handleposter}><IoImagesOutline /></button>
        <button id="coffeeroombtn" onClick={handleCoffee}><BiCoffeeTogo /></button>
        <button id="brainstormbtn" onClick={handleScreens}><IoBulbSharp /></button>
      </div>

      <div className="newinstance" id="newinstance">
      <iframe src="https://lottie.host/embed/1e1629b5-3968-4dae-a9cc-71554758f12c/oqCaw3shCu.lottie"></iframe>
        ⚠️ Another instance of your account has been detected. This session is no longer active.</div>
    </div>
  );
};

export default Canvas;
