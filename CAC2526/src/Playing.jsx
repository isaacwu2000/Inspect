import React, {useState, useEffect} from 'react';
import googleLogo from '/src/assets/google.svg';
import styles from './Playing.module.css'

import { 
    signOut, onAuthStateChanged, signInWithPopup, auth, provider, db,
    collection, doc, addDoc, updateDoc, setDoc, getDoc, getDocs, query, where, orderBy, limit, serverTimestamp
} from './main.jsx';

function Playing({ setIsLoggedIn, user }){
    async function logOut() {
        await signOut(auth);
        setIsLoggedIn(false);
    }

    async function getNextChallenge() {
        const querySnapshot = await getDocs(collection(db, "challenges"));
        querySnapshot.forEach((doc) => {
            console.log(`${doc.id} => ${doc.data()}`);
        });

    }

    const navBar = (
        <nav>
            <a href="/" className="logo">Inspect</a>
            <button onClick={logOut} id={styles.signOutBtn}>Sign out</button>
        </nav>
    );

    // <EyeThin size = {180} stroke = {1.0} className = "eye-hero" />  TODO: add this later
    // TODO: make level adapt
    const question = (
        <div id={styles.question}>
            <h1 id={styles.questionStatement}>Which one is false?</h1>
            <p id={styles.questionLevel}>Level 1</p>
        </div>
    )

    const challenge = (
        <div id={styles.challenge}>
            <div className={styles.challengeOption}>
                <p className={styles.challengeText}>
                    Pope Francis, the 266th Bishop of Rome and head of the Catholic Church, which has 1.4 billion worldwide followers, died on April 21 at age 88.
                </p>
                <button className={styles.challengeBtn}>This one!</button>
            </div>
            <div className={styles.challengeOption}>
                <p className={styles.challengeText}>
                    Pope Francis, the 266th Bishop of Rome and head of the Catholic Church, which has 1.4 billion worldwide followers, died on April 21 at age 88.
                </p>
                <button className={styles.challengeBtn}>No, this one!</button>
            </div>
        </div>
    )

    const solution = (
        <div></div>
    )

    return(
        <>
            {navBar}
            <main>
                <button onClick={getNextChallenge}>testing stuff</button>
                {question}
                {challenge}
                {solution}
            </main>
        </>
    );
}

export default Playing;