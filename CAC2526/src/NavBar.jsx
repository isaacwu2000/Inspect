// NavBar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import EyeLogo from './EyeLogo.jsx';
import ProfileAvatar from './ProfileAvatar.jsx';
import { signInWithPopup, signOut, auth, provider } from './firebase.js';
import './NavBar.css';

function NavBar({ mode, user }) {
  // mode: "public" or "authed"
  const location = useLocation();

  async function handleSignIn() {
    await signInWithPopup(auth, provider);
  }

  async function handleSignOut() {
    await signOut(auth);
  }

  // Brand click: toggle between landing and menu when signed in
  const brandHref = mode === "authed" && location.pathname === "/" ? "/menu" : "/";

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
              <Link className="profileBtn" to="/profile" title="Your profile" aria-label="Your profile">
                <ProfileAvatar
                  user={user}
                  imageClassName="avatar"
                  fallbackClassName="avatar placeholder"
                  fallbackAriaHidden={true}
                />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
