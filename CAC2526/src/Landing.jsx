// Landing.jsx
import React from 'react';
import googleLogo from '/src/assets/google.svg';
import NavBar from './NavBar.jsx';
import EyeLogo from './EyeLogo.jsx';
import { signInWithPopup, signOut, auth, provider } from './main.jsx';
import styles from './Landing.module.css';

function Landing(){
    async function handleSignIn() {
        await signInWithPopup(auth, provider);
    }

    const hero = (
        <>
            <div id={styles.banner}>
                <div>
                    <h1 id={styles.valueProp}>
                        Learn to distinguish <u>truth</u> from disinformation
                    </h1>
                    <p id={styles.subtitleProp}>
                        Inspect teaches you using engaging challenges
                        that model real-world, AI-generated content.
                    </p>
                </div>
                
                <EyeLogo size={142} className="eye-hero" />
            </div>

            <button onClick={handleSignIn} id={styles.signInBtnBig}>
                <img id={styles.googleLogo} src={googleLogo}/>
                <p>Sign in with Google</p>
            </button>
        </>
    );

    const mission = (
        <>
            <h1>Our Mission</h1>
            <p>
                Disinformation is everywhere.
                It warps elections, public health decisions, and even how you see your friends.
                Learn how to <u>spot lies instantly</u> while scrolling.
                Protect your mind from falsehood!
            </p>
        </>
    );

    const demo = (
        <>
            <h1>Demo</h1>
            <p>
                (Demo video placeholder)
            </p>
        </>
    );

    const about = (
        <>
            <h1>About</h1>
            <p>
                Hello! We're Isaac and Santi, two high-school Sophomores from Massachusetts. 
                We built Inspect because we’re watching AI-generated
                disinformation transform our world in real time, and want
                to stop it.
            </p>
        </>
    );

    const acknowledgements = (
        <>
            <h1>Acknowledgements</h1>
            <p>
                We'd like to thank the <a target="_blank" href="https://www.flintk12.com/">Flint</a> team
                for sponsoring API credits.
                We’d also like to thank writers from <a target="_blank" href="https://themiltonpaper.com/">The Milton Paper</a> for letting us use their articles, 
                and the <a target="_blank" href="https://www.congressionalappchallenge.us/">Congressional App Challenge Team</a> for
                organizing the challenge.
            </p>
        </>
    );

    return(
        <>
            <NavBar mode="public" />
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
