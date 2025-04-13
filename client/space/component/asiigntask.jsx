import React, { useEffect ,useState} from 'react'
import './assigntask.css'
import socket from './socketfront'

const Asiigntask = () => {

  const[task,setTask] = useState({
    task:'',
    deadline:'',
  })
  const[userid,setUserid] = useState('')
  const[name,setName] = useState('')

  useEffect(()=>{
    if(task.task!='' && task.deadline!='' && userid !=''){
      document.getElementById('assign').style.display = 'block'
    }
    else{
        document.getElementById('assign').style.display = 'none'
    }
  })


  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:5001/getalllogin', {
        headers: { accept: 'application/json' }
      });
      const data = await response.json();
      
      data.forEach(login => {
        if(login.role !='Manager'){
          const name = document.createElement('div');
        const id = document.createElement('div');
        const loggedin = document.createElement('div');
  
        name.className = 'name';
        id.className = 'userid';
        loggedin.className = 'loggedin';
  
        loggedin.addEventListener('click', handleid);
  
        name.innerText = login.username;
        id.innerText = login._id;
  
        loggedin.appendChild(name);
        loggedin.appendChild(id);
  
        document.getElementById('allusers').appendChild(loggedin);
        } 
      });
    };
  
    fetchData();
  }, []);

    const handleid = (e)=>{
      document.querySelectorAll('.loggedin').forEach(ele => {
        ele.style.backgroundColor = 'white' 
    });
    
      e.target.closest('.loggedin').style.backgroundColor = '#bedbff'
    setUserid(e.target.closest('.loggedin').querySelector('.userid').innerText) 
    setName(e.target.closest('.loggedin').querySelector('.name').innerText)
    }

    const handletasks = async()=>{
      const data = {task:task.task, deadline:task.deadline, userid: userid, name:name}
      setUserid('')
      setName('')
      setTask(()=>({...task, task:'',deadline:''})); 

      const alltask =  fetch('http://localhost:5001/task',{ method: 'post', headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
       alltask.then(response=>response.json()).then(data=>{
      if(data){
        
        socket.emit('taskassigned',data.done)
      }
    })}


  

  return (
    <>
       <div className="taskcont">
         <h4>Assign tasks ! </h4>
        <textarea type="text" value={task.task} onChange={(e)=>setTask(()=>({...task,task:e.target.value}))} name='taskassign' id='taskassign'/>
      
        <div className="alluser" id='allusers'></div>

        <div className="assign_date">

        <div class="date-container">
    
  <input type="date" value={task.deadline} onChange={(e)=>setTask(()=>({...task,deadline:e.target.value}))} id="date" />
        </div>

        <button id='assign' onClick={handletasks}>Assign</button>
        </div>
        
        </div>  
    </>
  )
}

export default Asiigntask
