import React, { useState } from 'react'
import './home.css'
import { useRef,useEffect } from 'react';
import Canvas from './canvas';
// import {io} from 'socket.io-client';

const Home = () => {

  useEffect(()=>{
    // socket.current = io('http://localhost:5001')
    // socket.current.emit('add-user', userid);


  },[])

  const getusers = async()=>{
   let get_users =  await fetch('http://localhost:5001/getusers',{headers:{accept:'application/json'}})
   let get_users1 = await get_users.json();
  //  setUsers(get_users1);
  //  console.log(get_users1)
  }


    
  return (
    <>
   
    <Canvas />
    </>
  )
}

export default Home
