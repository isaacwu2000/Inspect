import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'

import Landing from './Landing.jsx'
import MainMenu from './MainMenu.jsx'
import TwoChoiceGame from './TwoChoiceGame.jsx'
import BinaryGame from './BinaryGame.jsx'

import { auth, onAuthStateChanged } from './main.jsx'

//Not allowed to see certain stuff if ur not logged in
function ProtectedRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) {
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()

  //set page title once
  useEffect(() => {
    document.title = "Inspect"
  }, [])

  //not fun:
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setIsLoggedIn(!!u)
    })
    return () => unsub()
  }, [])

  //after login, if we're on "/", push them to /menu
  useEffect(() => {
    if (isLoggedIn && location.pathname === "/") {
      navigate('/menu', { replace: true })
    }
  }, [isLoggedIn, location.pathname, navigate])

  return (
    <Routes>
      {/*Public landing*/}
      <Route 
        path="/" 
        element={
          <Landing 
            setIsLoggedIn={setIsLoggedIn} 
          />
        } 
      />

      {/*Main menu (protected)*/}
      <Route 
        path="/menu" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <MainMenu user={user}/>
          </ProtectedRoute>
        } 
      />

      {/*Game mode A: Which one is false? (isaac mode)*/}
      <Route 
        path="/game/twochoice" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <TwoChoiceGame user={user}/>
          </ProtectedRoute>
        } 
      />

      {/*Game mode B: Real or AI? (santi mode yippeee fun)*/}
      <Route 
        path="/game/binary" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <BinaryGame user={user}/>
          </ProtectedRoute>
        } 
      />

      {/*lmao hopfully we don't need this:*/}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
