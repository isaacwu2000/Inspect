import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar.jsx';

function MainMenu({ user }) {
    return (
        <>
            <NavBar mode="authed" />
            <main>
                <h1 style={{marginTop:0, textAlign:'center'}}>
                    Greetings {user?.displayName || "there"}, please select a mode 👇
                </h1>

                <div style={{
                    display:'grid',
                    gridTemplateColumns:'repeat(auto-fit,minmax(min(280px,100%),1fr))',
                    gap:'24px',
                    marginTop:'32px'
                }}>

                    <Link to="/game/twochoice" style={{textDecoration:'none', color:'inherit'}}>
                        <div style={{
                            border:'1px solid black',
                            borderRadius:'20px',
                            boxShadow:'0px 1px 1.6px #2c2c2c',
                            padding:'20px',
                            background:'#fff',
                            transition:'all 0.2s ease'
                        }}>
                            <h2 style={{marginTop:0, marginBottom:'8px', lineHeight:1.2}}>
                                Which one is false?
                            </h2>
                            <p style={{margin:0, fontSize:'16px', lineHeight:1.4}}>
                                You recive two short statements. One is real, one is fake.
                                You must pick the lie in order to train your "AI-dar."
                            </p>
                        </div>
                    </Link>

                    <Link to="/game/binary" style={{textDecoration:'none', color:'inherit'}}>
                        <div style={{
                            border:'1px solid black',
                            borderRadius:'20px',
                            boxShadow:'0px 1px 1.6px #2c2c2c',
                            padding:'20px',
                            background:'#fff',
                            transition:'all 0.2s ease'
                        }}>
                            <h2 style={{marginTop:0, marginBottom:'8px', lineHeight:1.2}}>
                                Real or AI?
                            </h2>
                            <p style={{margin:0, fontSize:'16px', lineHeight:1.4}}>
                                You get one short piece of content. You must decide:
                                is this real human content, or AI-generated slop?
                            </p>
                        </div>
                    </Link>
                </div>
            </main>
        </>
    );
}

export default MainMenu;
