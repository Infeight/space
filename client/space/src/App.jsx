import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Home from '../component/home'
import Login from '../component/login'
import { AuthProvider } from '../component/authcontext.jsx'


function App() {
  const [count, setCount] = useState(0)

  return (
    <AuthProvider>
   <BrowserRouter>
       <Routes>
          <Route  path='/'  element={<Login/>}/>
          <Route path='/Home' element={<Home/>}/>
       </Routes>
   </BrowserRouter>
   </AuthProvider>
  )
}

export default App
