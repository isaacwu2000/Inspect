import { useState } from 'react'
import './App.css'
import Landing from './Landing.jsx'
import Playing from './Playing.jsx'

import { auth, onAuthStateChanged } from './main.jsx'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {isLoggedIn ? <Playing setIsLoggedIn={setIsLoggedIn}/> : <Landing setIsLoggedIn={setIsLoggedIn}/>}
    </>
  )
}

export default App
