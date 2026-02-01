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
    const [answeredCount, setAnsweredCount] = useState(0);
    const [level, setLevel] = useState(1);
    const [levelUp, setLevelUp] = useState(false);
    const seenRef = useRef(new Set());
    const [videoSrc, setVideoSrc] = useState('');
    const videoUrlRef = useRef(null);

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
        // revoke old URL
        if (videoUrlRef.current) {
            URL.revokeObjectURL(videoUrlRef.current);
            videoUrlRef.current = null;
        }
        if (!videoURL) {
            setVideoSrc('');
            return;
        }
        const videoRef = ref(storage, videoURL);
        const blob = await getBlob(videoRef);
        const objUrl = URL.createObjectURL(blob);
        videoUrlRef.current = objUrl;
        setVideoSrc(objUrl);
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

        const seen = seenRef.current;
        const allDocs = snap.docs;

        // Reset cycle once we've seen everything
        if (seen.size >= allDocs.length) {
            seen.clear();
        }

        // pick from unseen-in-session pool only
        const pool = allDocs.filter(d => !seen.has(d.id));

        if (pool.length === 0) {
            setCurrentChallengeData(null);
            setCurrentChallengeId(null);
            return;
        }

        const challengeSnap = pool[Math.floor(Math.random() * pool.length)];
        seen.add(challengeSnap.id);

        const challengeData = challengeSnap.data();
        await loadVideo(challengeData.videoURL);
        setCurrentChallengeData(challengeData);
        setCurrentChallengeId(challengeSnap.id);
    }

    useEffect(() => {loadChallenge();}, []);

    async function guessRealOrFake(guessIsReal) {
        if (answerLocked || !currentChallengeData) return;
        setAnswerLocked(true);

        if (!currentChallengeData) return;

        const correct = (guessIsReal === currentChallengeData.factual);
        const newStreak = correct ? streak + 1 : 0;
        setStreak(newStreak);

        const nextAnswered = answeredCount + 1;
        const newLevel = Math.floor(nextAnswered / 3) + 1;
        const leveledUp = newLevel > level;
        if (leveledUp) {
            setLevel(newLevel);
            setLevelUp(true);
            setTimeout(() => setLevelUp(false), 900);
        }
        setAnsweredCount(nextAnswered);

        const bonus = correct ? Math.max(newStreak - 1, 0) * 3 : 0;
        const levelBonus = (newLevel - 1) * 2;
        const xpAward = correct ? 10 + bonus + levelBonus : 4 + Math.max(levelBonus - 2, 0);

        setXpGain(xpAward);
        setTimeout(() => setXpGain(0), 1200);

        setStreakEvent(correct ? 'up' : 'break');
        setTimeout(() => setStreakEvent(null), 700);

        await updateCompletedChallenges(correct, xpAward, newStreak);
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
                    <p className={`${styles.questionLevel} ${levelUp ? styles.levelUp : ''}`}>
                        Level {level}
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
                        <video id="videoPlayer" controls loop src={videoSrc}></video>
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
