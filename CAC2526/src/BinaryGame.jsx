import React, {useState, useEffect} from 'react';
import styles from './Game.module.css';
import NavBar from './NavBar.jsx';
import EyeLogo from './EyeLogo.jsx';

import { db, storage, ref, getBlob, doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, where, increment } from './main.jsx';

function BinaryGame({ user }) {
    const [currentChallengeData, setCurrentChallengeData] = useState(null);
    const [currentChallengeId, setCurrentChallengeId] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [highlightStyle, setHighlightStyle] = useState("");
    const [streak, setStreak] = useState(0);
    const [xpGain, setXpGain] = useState(0);
    const [streakEvent, setStreakEvent] = useState(null);

    async function ensureUserExists() {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
            await setDoc(userRef, {
                displayName: user.displayName,
                email: user.email,
                xp: 0,
                answers: 0
            }, { merge: true });
        }
    }

    async function getCompletedChallenges() {
        await ensureUserExists();
        const completed = [];
        const completedRef = collection(db, "users", user.uid, "completedChallenges");
        const completedSnap = await getDocs(completedRef);
        completedSnap.forEach((d) => {
            completed.push(d.id);
        });
        return completed;
    }

    async function updateCompletedChallenges(wasCorrect = true, xpAward = 0, streakVal = 0) {
        await setDoc(doc(db, "users", user.uid, "completedChallenges", currentChallengeId),{
            challengeLevel: currentChallengeData.level,
            wasCorrect: wasCorrect
        });
        await updateUserXp(xpAward, streakVal);
        return true;
    }

    async function updateUserXp(xpAward, streakVal) {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            xp: increment(xpAward),
            answers: increment(1),
            streak: streakVal,
            displayName: user.displayName,
            email: user.email
        }, { merge: true });
    }

    async function loadVideo(videoURL) {
        // fix, TODO: URL.revokeObjectURL(uri);

        const videoRef = ref(storage, videoURL)
        const blob = await getBlob(videoRef);
        const video = document.getElementById("videoPlayer");
        video.src = URL.createObjectURL(blob);
    }

    async function loadChallenge() {
        setHighlightStyle("");

        const challengesRef = await collection(db, "challenges");
        const qChallenges = await query(challengesRef, orderBy("level", "asc"), where("level", "!=", 67));
        const snap = await getDocs(qChallenges);
        if (snap.empty) {setChallenge(null); return;}
        // TODO: implement getCompletedChallengers() here
        
        const completed = await getCompletedChallenges();
        let challengeSnap = snap.docs.find(d => !completed.includes(d.id));
        console.log(challengeSnap.data());
        if (!challengeSnap) {
            // Santi fallback option: just take first doc
            challengeSnap = snap.docs[0];
        }

        const challengeData = challengeSnap.data();
        console.log(challengeData);
        loadVideo(challengeData.videoURL);
        setCurrentChallengeData(challengeData);
        setCurrentChallengeId(challengeSnap.id);
        setFeedback("");
    }

    useEffect(() => {loadChallenge();}, []);

    function guessRealOrFake(guessIsReal) {
        if (!currentChallengeData) return;

        const correct = (guessIsReal === currentChallengeData.factual);
        const newStreak = correct ? streak + 1 : 0;
        setStreak(newStreak);

        const bonus = correct ? Math.max(newStreak - 1, 0) * 3 : 0;
        const xpAward = correct ? 10 + bonus : 4;

        setXpGain(xpAward);
        setTimeout(() => setXpGain(0), 1200);

        setStreakEvent(correct ? 'up' : 'break');
        setTimeout(() => setStreakEvent(null), 700);

        updateCompletedChallenges(correct, xpAward, newStreak);
        setFeedback(correct ? "Correct!" : `Nope. The answer was ${currentChallengeData.factual}`); //use emojis to give ppl dopamine or punish their naughty behavior
        console.log(correct ? "Correct!" : `Nope. The answer was ${currentChallengeData.factual}`);
        setHighlightStyle(correct ? styles.selectedCorrect : styles.selectedWrong);
    } 

    return (
        <>
            <NavBar mode="authed" user={user} />
            <main>
                <div className={styles.question}>
                    <h1 className={styles.questionStatement}>True or False?</h1>
                    <p className={styles.questionLevel}>
                        {currentChallengeData?.level != null ? `Level ${currentChallengeData.level}` : "Level ?"}
                    </p>
                    <EyeLogo size={64} className="eye-hero" animated={true} />
                    <div className={styles.statusRow}>
                        <div className={`${styles.streakBadge} ${streakEvent === 'up' ? styles.streakUp : ''} ${streakEvent === 'break' ? styles.streakBreak : ''}`}>
                            <span className={styles.flame}>🔥</span>
                            <span>Streak {streak}</span>
                        </div>
                        {xpGain > 0 && (
                            <div className={`${styles.xpToast} ${styles.pop}`}>
                                <span>+{xpGain} XP</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`${styles.singleCardWrapper} ${highlightStyle}`}>
                    <div className={styles.singleCard}>
                        <video id="videoPlayer" controls loop></video>
                        <p className={styles.singlePrompt}>
                            {currentChallengeData?.text != null ? currentChallengeData.text : "No challenge available."}
                        </p>

                        <div className={styles.binaryBtnRow}>
                            <button className={styles.binaryBtn} onClick={() => guessRealOrFake(true)}>True</button>
                            <button className={styles.binaryBtn} onClick={() => guessRealOrFake(false)}>False</button>
                        </div>
                    </div>
                </div>

                <div className={styles.feedback}>
                    {feedback && <div>{feedback}</div>}
                    {feedback && (
                        <button className={styles.nextBtn} onClick={() => loadChallenge()}>
                            Continue →
                        </button>
                    )}
                </div>
            </main>
        </>
    )
}

export default BinaryGame;
