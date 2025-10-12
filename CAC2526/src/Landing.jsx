import React, {useState, useEffect} from 'react';
import googleLogo from '/src/assets/google.svg';

import { signOut, onAuthStateChanged, signInWithPopup } from './main.jsx';
import { auth, provider } from './main.jsx';

function Landing({ setIsLoggedIn }){
    async function signInWithGoogle() {
        await signInWithPopup(auth, provider);
        setIsLoggedIn(true);
    }

    const navBar = (
        <nav>
            <a href="/" className="logo">Inspect</a>
            <button onClick={signInWithGoogle} id="loginBtn">Log in</button>
            <button onClick={signInWithGoogle} id="signupBtnSmall">Sign up</button>
        </nav>
    );
// <EyeThin size = {180} stroke = {1.0} className = "eye-hero" />  TODO: add this later
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
            <p>
                Disinformation, partialy from AI slop, has taken over the internet.
                It has the power to change elections and your opinions.
                We hope to allow you to quickly <u>discern truth from falsehood</u> with a little bit of practice. 
                Then, as you continue scrolling you won't be fooled as easily.
            </p>
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

            <h2>Contact</h2>
            Contact us at...
        </>
    );

    const acknowledgements = (
        <>
            <h1>Acknowledgements</h1>
            <p>
                We'd like to thank the <a target="_blank" href="https://www.flintk12.com/">Flint</a> team
                for sponsoring the API credits for this project.
                Also, we'd like to thank Rhys Adams, Harris Felix, Victoria Kirkham, Haotong Xue, and Joanna Zhang 
                (as well as another anonymous writer) from <a target="_blank" href="https://themiltonpaper.com/">The Milton Paper</a> for
                allowing us to use their articles.
                Additionally, we'd like to thank
                the <a target="_blank" href="https://www.congressionalappchallenge.us/">Congressional App Challenge</a> for
                organizing the challenge which motivated the development of this app.
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