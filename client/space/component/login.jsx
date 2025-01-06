import React from 'react'
import './login.css'
import { Link } from 'react-router-dom';
import { useState,useEffect,useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { io } from 'socket.io-client'




const Login = () => {

        const socket = useRef();
  
 
  let [user,setUser] = useState({
    username:"",
    password:""
  })

  let [signup,setSignup] = useState({
    username:"",
    password:"",
    mail:""
  })

  const [logins,setLogins] = useState([])
  const [newuser,setNewuser] = useState(true)
  const [showinp,setShowinp] = useState(false);
  
  const followinglist2 = []


  useEffect(()=>{
    alllogins()
    socket.current = io('https://spaceserver-05iz.onrender.com')
         
  },[])

  if(showinp==true){
    document.getElementById('input-cont').style.display = 'flex'
    document.getElementById('loading').style.display='none'
    document.getElementById('notfound').style.display = 'none'
    // clearInterval(interval)
  }

  // const setCookie = (name, value, days) => {
  //   const date = new Date();
  //   date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  //   const expires = "expires=" + date.toUTCString();
  //   document.cookie = `${name}=${value}; ${expires}; path=/; secure; samesite=lax`;
  // };
  
  // console.log(document.cookie)

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
     document.getElementById('loginbtn').style.backgroundColor = 'purple'
     document.getElementById('loginbtn').style.zIndex = '1'


  }
  

  const handleSignup = (e) => {
    name = e.target.name;
    value = e.target.value;
    setSignup({ ...signup, [name]: value })

    document.getElementById('signupbtn').style.zIndex = '0'
    document.getElementById('signupbtn').style.backgroundColor = 'purple'
    document.getElementById('signupbtn').innerText = 'Sign Up'
    document.getElementById('wrongnewpass').style.display = 'none'
  }

  const alllogins = async()=>{
   try{
    const alllogins1 = await fetch('https://spaceserver-05iz.onrender.com/getalllogin',{headers:{accept:'application/json'}})

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
     document.getElementById('loginbtn').style.backgroundColor = '#a064a0'
     document.getElementById('loginbtn').style.zIndex = '-1'


    const userdet = {
      username:user.username,
      password: user.password
    }
  const alllogin = fetch('https://spaceserver-05iz.onrender.com/login',{ method: 'post', headers: { "Content-Type": "application/json" }, body: JSON.stringify(userdet) })

  alllogin.then(response=>response.json()).then(data=>{
    console.log(data)
    if(data.loggedin!=null && data.loggedin.password === user.password){
  
      socket.current.emit('add-user', data.loggedin._id);

      localStorage.setItem('current-users',user.username)
      localStorage.setItem('current-users-pass',user.password)
      localStorage.setItem('current-id1', data.loggedin._id)
    
   document.getElementById('input-cont').style.display = 'none'
   document.getElementById('logo').style.display ='none'
     document.getElementById('welcomebackcont').style.display = 'flex'
    }
    else{
       document.getElementById('wrongpass').style.display = 'initial'
        document.getElementById('loginbtn').innerText = 'Log In'
     document.getElementById('loginbtn').style.backgroundColor = 'purple'
     document.getElementById('loginbtn').style.zIndex = '1'

    }
   
  })}

 if (newuser==false){
      document.getElementById("username").style.visibility = "visible"
  }
  }

  const submitSignup = async()=>{
     document.getElementById('signupbtn').style.zIndex = '-1'
     document.getElementById('signupbtn').style.backgroundColor = '#a064a0'
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
    else{
      localStorage.setItem('current-users',signup.username)
      localStorage.setItem('current-users-pass',signup.password)
   
      localStorage.setItem('followinglist1',JSON.stringify(followinglist2))
      document.getElementById('input-cont').style.display = 'none'
      document.getElementById('logo').style.display = 'none'
      document.getElementById('newusercont').style.display = 'flex'
      console.log(signup)
      await  fetch('https://spaceserver-05iz.onrender.com/signup', { method: 'post', headers: { "Content-Type": "application/json" }, body: JSON.stringify(signup) })
     
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
      

  return (
    <>

    <div className="cont">

      <div className="logo" id='logo'>COMMUNE</div>
      <div className="loading" id='loading'>

      {/* <DotLottieReact
      src="https://lottie.host/5da5bb72-96d6-4259-8dfa-587faa9c0e51/1qJAOfYK4M.lottie"
      loop
      autoplay
    /> */}
    <iframe id='loadingframe' src="https://lottie.host/embed/0779841c-24c8-4da4-b4bb-8b366930a3af/z6EltEHTOI.lottie" frameborder="0"></iframe>

    <p className='loadingstatement' id='loadingstatement'>{loadingstatements[Math.floor(Math.random()*5)]}</p>
    <p className='loadingstatement' id='notfound' style={{display:'none'}}>We're sorry for the inconvenience 😔</p>
      </div>

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

<div className='signbtn-holder'>
<button type='submit' className='submit-btn' onClick={handlesignin_anim}>Log In</button>

<button type='submit' id='signupbtn' className='submit-btn' onClick={()=>{submitSignup()}}>Sign up</button>
</div>
</div>

</div>

</div>


<div id='welcomebackcont'>
 
<div className="celebration1">
  <iframe id='celebration' src="https://lottie.host/embed/503bed59-c29d-46eb-935d-a996c60858a3/geOsLMBMTf.lottie" frameborder="0"></iframe>

  </div>

  <p className='welcomeback'>Welcome Back {user.username} !</p>
<button className='navbtn1'  ><Link to={'/Home'}>Home</Link></button>

</div>

<div id='newusercont'>
  <div className="celebration">
  <iframe id='celebration' src="https://lottie.host/embed/d7852d0f-dbde-43f2-9223-9233d839e93f/9i7ZLGOPeC.lottie" frameborder="0"></iframe>

  </div>
  <p className='welcomeback'>
Welcome to Commune! 🎉 <br />

We're so glad you've joined us.</p>
<button className='navbtn1'  ><Link to={'/Home'}>Home</Link></button>

</div>

  
    </>
  )
}

export default Login
