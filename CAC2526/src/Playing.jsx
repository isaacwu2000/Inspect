import React, {useState, useEffect} from 'react';
import googleLogo from '/src/assets/google.svg';
import styles from './Playing.module.css'

import { 
    signOut, onAuthStateChanged, signInWithPopup, auth, provider, db,
    collection, doc, addDoc, updateDoc, setDoc, getDoc, getDocs, query, where, orderBy, limit, serverTimestamp
} from './main.jsx';

function Playing({ setIsLoggedIn, user }){
    const [currentChallengeId, setCurrentChallengeId] = useState();

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

        for (const doc of querySnapshot.docs) {
            const id = doc.id;
            if (!completedChallenges.includes(id)) {
                console.log(id);
                setCurrentChallengeId(id);
                return id;
            }
        }

        const challengeId = querySnapshot.docs[0].id; // TODO: make this a random doc
        console.log(challengeId);
        setCurrentChallengeId(challengeId);
        return challengeId; // If the user somehow has completed all challenges
    }

    async function updateCompletedChallenges() {
        await ensureUserExists();

        const completedChallengesRef = collection(db, "users", user.uid, "completedChallenges");
        // TODO
        // check if the user is correct or not
    }

    // useEffect when currentChallengeId is changed, update the html
    async function updateDisplayedChallenge() {
        if (!currentChallengeId) return;
        console.log(currentChallengeId); // i'm going crazy
        const currentChallengeRef = doc(db, "challenges", currentChallengeId);
        const currentChallengeSnapshot = await getDoc(currentChallengeRef);
        const currentChallengeData = await currentChallengeSnapshot.data();
        const optionTrueText = currentChallengeData.optionTrue;
        const optionFalseText = currentChallengeData.optionFalse;
        
        console.log(currentChallengeData);

        if (Math.random() > 0.5) {
            document.getElementById("option1").innerHTML = optionTrueText;
            document.getElementById("option2").innerHTML = optionFalseText;
        } else {
            document.getElementById("option1").innerHTML = optionFalseText;
            document.getElementById("option2").innerHTML = optionTrueText;
        }
    }

    async function nextChallenge() {
        console.log(await getNextChallenge());
        console.log(currentChallengeId);
        await updateDisplayedChallenge();
    }
    /*
    useEffect(() => {
        async function initChallenge() {
            const challengeId = await getNextChallenge();
            if (!currentChallengeId) {
                console.log(challengeId);
                await setCurrentChallengeId("test");
                console.log(currentChallengeId);
            }
            console.log(currentChallengeId);
            await updateDisplayedChallenge();
            console.log(currentChallengeId);
        }
        initChallenge();
    }, []); 
    */
    useEffect(() => {
        async function initChallenge() {
            await getNextChallenge();
        }
        initChallenge();
    }, []);
    useEffect(() => {
        updateDisplayedChallenge();
    }, [currentChallengeId]);
    
    const navBar = (
        <nav>
            <a href="/" className="logo">Inspect</a>
            <button onClick={logOut} id={styles.signOutBtn}>Sign out</button>
        </nav>
    );

    //<EyeThin size = {180} stroke = {1.0} className = "eye-hero" /> TODO: add this later
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
                <p id="option1" className={styles.challengeText}>
                    
                </p>
                <button className={styles.challengeBtn}>This one!</button>
            </div>
            <div className={styles.challengeOption}>
                <p id="option2" className={styles.challengeText}>
                    
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
                <button onClick={nextChallenge}>testing stuff</button>
                {question}
                {challenge}
                {solution}
            </main>
        </>
    );
}

export default Playing;