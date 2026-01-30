import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar.jsx';
import styles from './MainMenu.module.css';

function MainMenu({ user }) {
    return (
        <>
            <NavBar mode="authed" />
            <main className={styles.menu}>
                <h1 style={{marginTop:0, textAlign:'center'}}>
                    Greetings {user?.displayName || "there"}, please select a mode:
                </h1>

                <div className={styles.optionsGrid}>
                    <Link to="/game/binary" style={{textDecoration:'none', color:'inherit'}}>
                        <div className={styles.card}>
                            <h2 style={{marginTop:0, marginBottom:'8px', lineHeight:1.2}}>
                                True or False?
                            </h2>
                            <p style={{margin:0, fontSize:'16px', lineHeight:1.4}}>
                                You must decide whether a piece of content
                                disinformation or factually correct.
                            </p>
                        </div>
                    </Link>
                    <Link to="/game/twochoice" style={{textDecoration:'none', color:'inherit'}}>
                        <div className={styles.card}>
                            <h2 style={{marginTop:0, marginBottom:'8px', lineHeight:1.2}}>
                                Which one?
                            </h2>
                            <p style={{margin:0, fontSize:'16px', lineHeight:1.4}}>
                                You recive two short statements: one factual, one false.
                                You must detect the lie.
                            </p>
                        </div>
                    </Link>
                </div>
            </main>
        </>
    );
}

export default MainMenu;
