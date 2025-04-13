import React from 'react'
import './login.css'
import { Link } from 'react-router-dom';
import { useState,useEffect,useRef } from 'react';
import { Navigate } from 'react-router-dom';
import socket from './socketfront';
import { io } from 'socket.io-client'
import { useNavigate } from "react-router-dom";
import { useAuth } from './authcontext.jsx';
import { BiSignal1 } from 'react-icons/bi';



const Login = () => {

  const { login } = useAuth(); 
  const navigate = useNavigate();
 
  let [user,setUser] = useState({
    username:"",
    password:""
  })

  let [signup,setSignup] = useState({
    username:"",
    password:"",
    role:"",
    mail:""
  })

  const [dp,setDp] = useState('');

  const [logins,setLogins] = useState([])
  const [newuser,setNewuser] = useState(true)
  const [showinp,setShowinp] = useState(false);
  
  const followinglist2 = []



  useEffect(()=>{
      
  //   socket.current = io('ws://localhost:5001', {
  //     transports: ['websocket'],
  // });
              alllogins();
   },[])

  if(showinp==true){
    document.getElementById('input-cont').style.display = 'flex'
    document.getElementById('loading').style.display='none'
    document.getElementById('notfound').style.display = 'none'
  
  }



  const handlesignup_anim = ()=>{
    document.getElementById('cover').style.borderRadius = "5px 0px 0px 5px"
    // document.getElementById('cover').getElementsByTagName('iframe').src= 'https://lottie.host/embed/4ed902e0-497a-48fe-a39b-045df9baf9db/4SqjSEaEBR.lottie'
    document.getElementById('signupgif').style.display = 'block'
    document.getElementById('signingif').style.display = 'none'

    document.getElementById("input-cont").style.flexDirection = "row"
    document.getElementById('logincont').style.display = "none"
    document.getElementById('signupcont').style.display = "flex"
  }

  const handlesignin_anim = ()=>{
    document.getElementById('cover').style.borderRadius = "5px 0px 0px 5px"
    document.getElementById('cover').getElementsByTagName('iframe').src = 'https://lottie.host/embed/fe93e82c-38bc-45ec-aa6a-2dc72341d3c1/hO0M5SKM7L.lottie'
    document.getElementById("input-cont").style.flexDirection = "row"
    document.getElementById('signingif').style.display = 'block'
    document.getElementById('signupgif').style.display = 'none'

    document.getElementById('logincont').style.display = "flex"
    document.getElementById('signupcont').style.display = "none"
  }

  let name; let value;
  const handleChange = (e) => {
    name = e.target.name;
    value = e.target.value;
    setUser({ ...user, [name]: value })

    document.getElementById('wrongpass').style.display = 'none'
        document.getElementById('loginbtn').innerText = 'Log In'
     document.getElementById('loginbtn').style.backgroundColor = '#1F2F43'
     document.getElementById('loginbtn').style.zIndex = '1'


  }
  

  const handleSignup = (e) => {
    name = e.target.name;
    value = e.target.value;
    setSignup({ ...signup, [name]: value })
    // console.log(signup)

    document.getElementById('signupbtn').style.zIndex = '0'
    document.getElementById('signupbtn').style.backgroundColor = '#1F2F43'
    document.getElementById('signupbtn').innerText = 'Sign Up'
    document.getElementById('wrongnewpass').style.display = 'none'
  }

  const alllogins = async()=>{
   try{
    const alllogins1 = await fetch('http://localhost:5001/getalllogin',{headers:{accept:'application/json'}})

   const alllogins11 = await alllogins1.json();
   alllogins11.map(logindet=>{
   setLogins(prev=>[...prev,logindet.password])
   setShowinp(true);
   })
   }
   catch{
    console.log('hjb')
    document.getElementById('input-cont').style.display = 'none'
    document.getElementById('loading').style.display='block'
    document.getElementById('loadingstatement').style.display = 'none'
    document.getElementById('logo').style.display = 'none'
    document.getElementById('notfound').style.display = 'block'
   }
  }
  
  // console.log(logins)

  const submit = async()=>{

    if(user.username==''|| user.password==''){
      document.getElementById('username').style.border = '1px solid red'
           document.getElementById('password').style.border = '1px solid red'
         }
         else{

     document.getElementById('loginbtn').innerText = 'Log In ...'
     document.getElementById('loginbtn').style.backgroundColor = '#1F2F43'
     document.getElementById('loginbtn').style.zIndex = '-1'


    const userdet = {
      username:user.username,
      password: user.password
    }
  const alllogin = fetch('http://localhost:5001/login',{ method: 'post', headers: { "Content-Type": "application/json" }, body: JSON.stringify(userdet) })

  alllogin.then(response=>response.json()).then(data=>{
    console.log(data)
    if(data.loggedin!=null && data.loggedin.password === user.password){
      socket.emit('add-user',{id:data.loggedin._id, name:user.username, role:data.loggedin.role,dp:data.loggedin.dp});

      const userData = { id:data.loggedin._id, name:user.username , role: data.loggedin.role, dp:data.loggedin.dp};
      login(userData); 

     
      localStorage.setItem('current-users',user.username)
      localStorage.setItem('current-users-pass',user.password)
      localStorage.setItem('current-id1', data.loggedin._id)
    
    document.getElementById('logincont').style.display = 'none'
   document.getElementById('logo').style.display ='none'
     document.getElementById('welcomebackcont').style.display = 'flex'
    }
    else{
       document.getElementById('wrongpass').style.display = 'initial'
        document.getElementById('loginbtn').innerText = 'Log In'
     document.getElementById('loginbtn').style.backgroundColor = '#1F2F43'
     document.getElementById('loginbtn').style.zIndex = '1'

    }
   
  })}

 if (newuser==false){
      document.getElementById("username").style.visibility = "visible"
  }
  }

  const submitSignup = async()=>{
     document.getElementById('signupbtn').style.zIndex = '-1'
     document.getElementById('signupbtn').style.backgroundColor = '#1F2F43'
     document.getElementById('signupbtn').innerText = 'Sign Up...'
     
     let samepass =false;
    logins.forEach(ele=>{
      if(ele===signup.password){ samepass = true}
    })
  
     if(signup.username==''|| signup.password==''){
 document.getElementById('username1').style.border = '1px solid red'
      document.getElementById('password1').style.border = '1px solid red'
    }
    else if(samepass==true){
      document.getElementById('password1').style.border = '1px solid red'
      document.getElementById('wrongnewpass').style.display = 'block'
      // document.getElementById('password1').value = 'Password taken'
    }
    else if(signup.role ==''){
      document.getElementById('rolecont').style.border = '1px solid red'
    }
    else{
      localStorage.setItem('current-users',signup.username)
      localStorage.setItem('current-users-pass',signup.password)
   
      localStorage.setItem('followinglist1',JSON.stringify(followinglist2))
      document.getElementById('input-cont').style.display = 'none'
      document.getElementById('logo').style.display = 'none'
      document.getElementById('newusercont').style.display = 'flex'
      
      let data = {
        username:signup.username,
        password:signup.password,
        role:signup.role,
        mail:signup.mail,
        dp:dp
      }

      await  fetch('http://localhost:5001/signup', { method: 'post', headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
     
    }


    }
 

    let loadingstatements  = ['Just a moment... Excellence can’t be rushed!',
      'Grabbing the magic wand... Sparkles loading!',
      'Almost there! Great experiences are just seconds away.',
      'We’re cooking up something great—almost done baking!',
      'Loading... This is a great time to take a deep breath!']

    // const interval =  setInterval(()=>{
    //     document.getElementById('loadingstatement').innerText = loadingstatements[Math.floor(Math.random()*5)]
    //   },3000)

    const handledp=(e)=>{
      document.querySelectorAll('.selectdpimg').forEach(element => {
        element.style.border = 'none'
      })
      e.target.style.border = '2px solid #1F2F43'
      setDp(e.target.alt)
       
    }
      

  return (
    <>
  <div className="nophone" id='nophone'>

  💻✨ Optimized for Desktop <br /> <br />

  🚫📱 Mobile & Tablet Access Limited <br /> <br />

This workspace is specially designed for laptops and desktop computers 💼🖥️

For the best experience — including full canvas features, meetings, and team interactions — please switch to a larger screen. 

Thanks for understanding! 💙
  </div>
    <div className="cont">

      {/* <div className="logo" id='logo'>SPACE.</div> */}
      {/* <img className='logo' src="logo.png" alt="" /> */}

      <div className="loading" id='loading'>

      {/* <DotLottieReact
      src="https://lottie.host/5da5bb72-96d6-4259-8dfa-587faa9c0e51/1qJAOfYK4M.lottie"
      loop
      autoplay
    /> */}

    <iframe id='loadingframe' src="https://lottie.host/embed/d2511452-7f46-41b9-af81-260b4a581ecd/b5fPioz7kC.lottie" frameborder="0"></iframe>

    <p className='loadingstatement' id='loadingstatement'>{loadingstatements[Math.floor(Math.random()*5)]}</p>
    <p className='loadingstatement' id='notfound' style={{display:'none'}}>We're sorry for the inconvenience 😔</p>
      </div>

      <img className='logo' id='logo' src="logo.png" alt="" />

<div className="input-cont" id='input-cont'>

 

    <div className="logincont" id='logincont'> Sign In
<div id='wrongpass' className='wrongpass' style={{display:'none'}}>Incorrect username or password.<br /> New to Commune? Please sign up!</div>


    <input type="text" name='username' value={user.username} placeholder='Username' id='username' onChange={handleChange}/>
    <input type="text" name='password' value={user.password} placeholder='Password' id='password' onChange={handleChange} />
    
   <div className='signbtn-holder'>
   <button type='submit' className='submit-btn' id='loginbtn' onClick={()=>{submit()}}>Log In</button>

   <button  className='submit-btn' onClick={handlesignup_anim}>Sign Up</button>
   </div>

    </div>

    <div className="cover" id='cover'>
      {/* <p id='cover-p'>Log In to Commune!</p> */}
      <iframe id='signingif' style={{display:'block'}} src="https://lottie.host/embed/fe93e82c-38bc-45ec-aa6a-2dc72341d3c1/hO0M5SKM7L.lottie" frameborder="0"></iframe>
      <iframe id='signupgif' style={{display:'none'}} src="https://lottie.host/embed/002408d7-8a31-4096-9651-9d3e0d9bbb03/72dB3Boe0J.lottie" frameborder="0"></iframe>
    </div>

    <div className="signupcont" id='signupcont'> Sign Up
    <div className='wrongpass' id='wrongnewpass' style={{display:'none'}}>This password is already taken.<br /> Please think of a new one. </div>
<input type="text" name='username' id='username1' placeholder='Username' value={signup.username}  onChange={handleSignup}/>
<input type="text" name='password' id='password1' placeholder='Password' value={signup.password}  onChange={handleSignup}/>
<input type="text" name='mail' id='mail1' placeholder='E-mail' value={signup.mail} onChange={handleSignup}/>

<div className="selectdp-head">Select your character</div>
<div className="selectdp">
  <img className='selectdpimg' onClick={handledp} src="people1.avif"  alt="people1.avif" />
  <img className='selectdpimg' onClick={handledp} src="people2.avif" alt="people2.avif" />
  <img className='selectdpimg' onClick={handledp} src="people3.avif" alt="people3.avif" />
  <img className='selectdpimg' onClick={handledp} src="people4.avif" alt="people4.avif" />
  <img className='selectdpimg' onClick={handledp} src="people5.avif" alt="people5.avif" />
  <img className='selectdpimg' onClick={handledp} src="people6.avif" alt="people6.avif" />
</div>

<div className="selectdp-head">Select your role</div>

<div className="rolecont" id='rolecont'>
<input type="radio" name='role'  value="Manager"  id='role' onChange={handleSignup} />
<span>Manager</span>
<input type="radio" name='role'  value="Employee"  id='role' onChange={handleSignup} />
<span>Employee</span>
</div>


<div className='signbtn-holder'>
<button type='submit' className='submit-btn' onClick={handlesignin_anim}>Log In</button>

<button type='submit' id='signupbtn' className='submit-btn' onClick={()=>{submitSignup()}}>Sign up</button>
</div>
</div>

</div>

</div>


<div id='welcomebackcont'>
 
<div className="celebration1">
 
 <img src="logo.png" alt="" />
  </div>

  <p className='welcomeback'>Welcome Back {user.username} !</p>
<Link to={'/Home'}><button className='navbtn1'  >Home</button></Link>

</div>

<div id='newusercont'>
  <div className="celebration1">
 
  <img src="logo.png" alt="" />
  </div>
  <p className='welcomeback'>
Welcome to Space! <br />

We registered a new user.<br />Please login with your details.</p>
<Link to={'/'}><button className='navbtn1' onClick={()=>{document.getElementById('newusercont').style.display='none'; document.getElementById('logo').style.display = 'block'}}>Login</button></Link>


</div>

  
    </>
  )
}

export default Login
