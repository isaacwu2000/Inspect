import React, {useState, useEffect} from 'react';
import googleLogo from '/src/assets/google.svg';

import { signOut, onAuthStateChanged, signInWithPopup } from './main.jsx';
import { auth, provider } from './main.jsx';

function Playing({ setIsLoggedIn }){
    function logOut() {
        signOut(auth);
        setIsLoggedIn(false);
    }

    const navBar = (
        <nav>
            <a href="/" className="logo">Inspect</a>
            <button onClick={logOut} id="signOutBtn">Sign out</button>
        </nav>
    );
// <EyeThin size = {180} stroke = {1.0} className = "eye-hero" />  add this later

    return(
        <>
            {navBar}
            <main>
                hi
            </main>
        </>
    );
}

export default Playing;