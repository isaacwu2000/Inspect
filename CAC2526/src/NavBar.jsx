// NavBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import EyeLogo from './EyeLogo.jsx';
import { signInWithPopup, signOut, auth, provider } from './main.jsx';
import './NavBar.css';

function NavBar({ mode }) {
  // mode: "public" or "authed"

  async function handleSignIn() {
    await signInWithPopup(auth, provider);
  }

  async function handleSignOut() {
    await signOut(auth);
  }

  // Brand click: always goes to public landing so signed-in users can revisit it
  const brandHref = mode === "authed" ? "/" : "/";

  return (
    <nav className="navbar">
      <div className="navbarInner">
        <Link 
          to={brandHref}
          className="brand"
        >
          <EyeLogo size={24} animated={true} trackCursor={true} />
          <span className="brandText">Inspect</span>
        </Link>

        <div className="navActions">
          {mode === "public" ? (
            <>
              <button className="navBtn" onClick={handleSignIn}>Log In</button>
              <button className="navBtn outlined" onClick={handleSignIn}>Sign Up</button>
            </>
          ) : (
            <>
              <Link className="navLink" to="/menu">Menu</Link>
              <button className="navBtn" onClick={handleSignOut}>Sign out</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
