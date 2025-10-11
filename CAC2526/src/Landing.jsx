import React, {useState, useEffect} from 'react';
import googleLogo from '/src/assets/google.svg';

import { signOut, onAuthStateChanged, signInWithPopup } from './main.jsx';
import { auth, provider } from './main.jsx';

function Landing(){
    function signInWithGoogle() {
        signInWithPopup(auth, provider);
        console.log('test');
    }

    const navBar = (
        <nav>
            <a href="/" className="logo">Inspect</a>
            <button id="loginBtn">Log in</button>
            <button id="signupBtnSmall">Sign up</button>
        </nav>
    );
// <EyeThin size = {180} stroke = {1.0} className = "eye-hero" />  add this later
    const hero = (
        <>
            <div id="banner">
                <h1 id="valueProp">
                    Learn to distinguish <u>truth</u> from disinformation
                </h1>    
            </div>
            <button onClick={signInWithGoogle} id="signUpWithGoogle">
                <img id="googleLogo" src={googleLogo}></img>
                Sign up with Google
            </button>
        </>
    );

    const mission = (
        <>
            <h1>Our Mission</h1>
            <p>Combat disinformation...AI slop</p>
        </>
    );

    const demo = (
        <>
            <h1>Demo</h1>
            Put video here
        </>
    );

    const about = (
        <>
            <h1>About</h1>
            image of isaac
            image of santi
            how we got the idea...prove we're human
        </>
    );

    const acknowledgements = (
        <>
            <h1>Acknowledgements</h1>
            <p>
                We'd like to thank the <a href="https://www.flintk12.com/">Flint</a> team for sponsoring the API credits for this project
                Also, we'd like to thank...from <a href="https://themiltonpaper.com/">The Milton Paper</a> for allowing us to use their articles.
                Additionally we'd like to thank the Congressional App Challenge team for...
            </p>
        </>
    );

    return(
        <>
            {navBar}
            <main>
                {hero}
                {mission}
                {demo}
                {about}
                {acknowledgements}
            </main>
        </>
    );
}
export default Landing;