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
    
    async function createNewUser() {
        await setDoc(doc(db, "users", user.uid), {
            displayName: user.displayName,
            email: user.email
        });
    }

    async function ensureUserExists() {
        const userRef = await doc(db, "users", user.uid);
        const snap = await getDoc(userRef)
        if (snap.exists()) {return snap.data();} 
        else {createNewUser();}
    }

    async function getCompletedChallenges() {
        await ensureUserExists();

        let completedChallenges = [];
        const completedChallengesRef = collection(db, "users", user.uid, "completedChallenges");
        const querySnapshot = await getDocs(completedChallengesRef);
        querySnapshot.forEach((doc) => {
            completedChallenges.push(doc.id);
            console.log(`${doc.id} => ${doc.data()}`);
        });

        return completedChallenges;
    }

    async function getNextChallenge() {
        const completedChallenges = await getCompletedChallenges();
        const challengesRef = await collection(db, "challenges");
        
        // Firestore levels should be increasing for tutorials and a constant, higher number for freeplay
        const q = await query(challengesRef, orderBy("level", "asc")); 
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            if (!completedChallenges.includes(doc.id)) {
                console.log(doc.id);
                return doc.id;
            }
        });
        console.log(querySnapshot[0].id);
        return querySnapshot[0].id; // If the user somehow has completed all challenges
    }

    async function updateCompletedChallenges() {
        await ensureUserExists();
        
        const completedChallengesRef = collection(db, "users", user.uid, "completedChallenges");
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