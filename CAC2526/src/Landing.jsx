// Landing.jsx
import React from 'react';
import googleLogo from '/src/assets/google.svg';
import NavBar from './NavBar.jsx';
import EyeLogo from './EyeLogo.jsx';

function Landing(){
    const hero = (
        <>
            <div id="banner" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '24px',
                padding: '24px 0'
            }}>
                <h1 id="valueProp" style={{
                    fontSize: 'clamp(28px,4vw,44px)',
                    lineHeight: '1.1',
                    margin: 0,
                    flex: 1
                }}>
                    Learn to distinguish <u>truth</u> from disinformation
                </h1>
                <EyeLogo size={64} className="eye-hero" />
            </div>

            <div style={{display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
                <img id="googleLogo" src={googleLogo} style={{width:'24px',height:'24px'}}/>
                <p style={{margin:0,fontSize:'18px',opacity:'0.8'}}>
                    Sign in with Google in the top right to start practicing.
                </p>
            </div>
        </>
    );

    const mission = (
        <>
            <h1>Our Mission</h1>
            <p>
                Disinformation — a lot of it AI slop — is everywhere.
                It can warp elections, public health decisions, and even how you see your friends.
                We want you to build fast instincts so you can <u>spot lies instantly</u> while scrolling.
            </p>
        </>
    );

    const demo = (
        <>
            <h1>Demo</h1>
            <p style={{opacity:0.7}}>
                (Demo video placeholder)
            </p>
        </>
    );

    const about = (
        <>
            <h1>About</h1>
            <p style={{marginTop:0}}>
                • Isaac (human)  
                • Santi (also human)  
                We built this because we’re watching people get fooled in real time.
            </p>

            <h2>Contact</h2>
            <p style={{marginTop:0}}>
                Reach out at contact@example.com.
            </p>
        </>
    );

    const acknowledgements = (
        <>
            <h1>Acknowledgements</h1>
            <p>
                We'd like to thank the <a target="_blank" href="https://www.flintk12.com/">Flint</a> team
                for sponsoring API credits.
                We’d also like to thank writers from <a target="_blank" href="https://themiltonpaper.com/">The Milton Paper</a>
                for letting us use their articles, and the 
                <a target="_blank" href="https://www.congressionalappchallenge.us/"> Congressional App Challenge</a>
                for motivating us to build this.
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
