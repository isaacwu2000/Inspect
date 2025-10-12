import { useState, useEffect } from 'react'
import './App.css'
import Landing from './Landing.jsx'
import Playing from './Playing.jsx'

import { auth, onAuthStateChanged } from './main.jsx'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState();

  onAuthStateChanged(auth, user => setUser(user))

  useEffect(() => {
    document.title = "Inspect";
  }, []);

  return (
    <>
      {isLoggedIn ? 
        <Playing setIsLoggedIn={setIsLoggedIn} user={user}/> : 
        <Landing setIsLoggedIn={setIsLoggedIn}/>
      }
    </>
  )
}

export default App
