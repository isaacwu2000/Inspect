import React, {useState, useEffect, useRef} from 'react';
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
    const [answerLocked, setAnswerLocked] = useState(false);
    const nextTimerRef = useRef(null);
    const [feedbackKey, setFeedbackKey] = useState(0);

    // lock scrolling only while this screen is mounted
    useEffect(() => {
        const prevBodyOverflow = document.body.style.overflow;
        const prevDocOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevBodyOverflow;
            document.documentElement.style.overflow = prevDocOverflow;
        };
    }, []);

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

    function clearNextTimer() {
        if (nextTimerRef.current) {
            clearTimeout(nextTimerRef.current);
            nextTimerRef.current = null;
        }
    }

    async function loadChallenge() {
        clearNextTimer();
        setAnswerLocked(false);
        setXpGain(0);
        setStreakEvent(null);
        setHighlightStyle("");
        setFeedback("");

        const challengesRef = await collection(db, "challenges");
        const qChallenges = await query(challengesRef, orderBy("level", "asc"), where("level", "!=", 67));
        const snap = await getDocs(qChallenges);
        if (snap.empty) {
            setCurrentChallengeData(null);
            setCurrentChallengeId(null);
            return;
        }
        // TODO: implement getCompletedChallengers() here
        
        const completed = await getCompletedChallenges();
        let challengeSnap = snap.docs.find(d => !completed.includes(d.id));
        if (!challengeSnap) {
            // fallback: just take first doc
            challengeSnap = snap.docs[0];
        }
        if (!challengeSnap) {
            setCurrentChallengeData(null);
            setCurrentChallengeId(null);
            return;
        }

        const challengeData = challengeSnap.data();
        loadVideo(challengeData.videoURL);
        setCurrentChallengeData(challengeData);
        setCurrentChallengeId(challengeSnap.id);
    }

    useEffect(() => {loadChallenge();}, []);

    function guessRealOrFake(guessIsReal) {
        if (answerLocked || !currentChallengeData) return;
        setAnswerLocked(true);

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
        setFeedbackKey(k => k + 1);
        console.log(correct ? "Correct!" : `Nope. The answer was ${currentChallengeData.factual}`);
        setHighlightStyle(correct ? styles.selectedCorrect : styles.selectedWrong);

        nextTimerRef.current = setTimeout(() => {
            loadChallenge();
        }, 1200);
    } 

    return (
        <>
            <NavBar mode="authed" user={user} />
            <main className={styles.binaryMain}>
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

                <div className={`${styles.feedback} ${feedback ? styles.feedbackVisible : ''}`}>
                    {feedback && (
                        <div key={feedbackKey} className={styles.feedbackMessage}>
                            {feedback}
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}

export default BinaryGame;
