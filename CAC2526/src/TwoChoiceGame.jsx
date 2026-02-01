import React, {useState, useEffect, useRef} from 'react';
import styles from './Game.module.css';
import NavBar from './NavBar.jsx';
import EyeLogo from './EyeLogo.jsx';
import { auth, db, signOut, storage, ref, getBlob, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, increment } from './main.jsx';

function TwoChoiceGame({ user }){
    const [currentChallengeId, setCurrentChallengeId] = useState(null);
    const [challengeData, setChallengeData] = useState(null);
    const [options, setOptions] = useState([]); //[textA, textB]
    const [falseIndex, setFalseIndex] = useState(null); //Santi: index of the FALSE statement
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [streak, setStreak] = useState(0);
    const [xpGain, setXpGain] = useState(0);
    const [streakEvent, setStreakEvent] = useState(null);
    const [answerLocked, setAnswerLocked] = useState(false);
    const nextTimerRef = useRef(null);
    const [feedbackKey, setFeedbackKey] = useState(0);

    // lock scrolling while this screen is mounted
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

    async function loadVideos(videoURLTrue, videoURLFalse) {
        // fix, TODO: URL.revokeObjectURL(uri);
        //await options
        const videoRefTrue = ref(storage, videoURLTrue)
        const videoRefFalse = ref(storage, videoURLFalse)
        const blobTrue = await getBlob(videoRefTrue);
        const blobFalse = await getBlob(videoRefFalse);

        let videoElementTrue;
        let videoElementFalse;
        if (falseIndex == 1) {
            videoElementTrue = document.getElementById("videoPlayer0");
            videoElementFalse = document.getElementById("videoPlayer1");
        } else {
            videoElementTrue = document.getElementById("videoPlayer0");
            videoElementFalse = document.getElementById("videoPlayer1");
        }

        videoElementTrue.src = URL.createObjectURL(blobTrue);
        videoElementFalse.src = URL.createObjectURL(blobFalse);
    }

    async function pickNextChallenge() {
        clearNextTimer();
        setAnswerLocked(false);
        setSelectedIdx(null);
        setFeedback("");
        setXpGain(0);
        setStreakEvent(null);

        // get next unseen challenge (session-unique until all seen)
        const challengesRef = collection(db, "challenges");
        const qChallenges = query(challengesRef, orderBy("level", "asc"), where("level", "==", 67));
        const qSnap = await getDocs(qChallenges);

        const seen = seenRef.current;
        const allDocs = qSnap.docs;

        if (allDocs.length === 0) {
            setCurrentChallengeId(null);
            setChallengeData(null);
            return;
        }

        if (seen.size >= allDocs.length) {
            seen.clear();
        }

        const pool = allDocs.filter(d => !seen.has(d.id));
        if (pool.length === 0) {
            setCurrentChallengeId(null);
            setChallengeData(null);
            return;
        }

        const chosenDoc = pool[Math.floor(Math.random() * pool.length)];
        seen.add(chosenDoc.id);

        console.log(chosenDoc.data());
        setCurrentChallengeId(chosenDoc.id);
        setChallengeData(chosenDoc.data());
    }

    // Shuffle two options but make sure that we remember which one is false.
    async function prepareOptions(data) {
        const pair = [
            { text: data.optionTrue, isFalse: false },
            { text: data.optionFalse, isFalse: true }
        ];

        //Shuffel time!!!!
        pair.sort(() => Math.random() - 0.5);

        const texts = pair.map(p => p.text);
        const idxFalse = pair.findIndex(p => p.isFalse === true);

        setOptions(texts);
        setFalseIndex(idxFalse);

        await loadVideos(data.videoTrue, data.videoFalse)
    }

    //load first challenge on mount (hi Isaac, see look i did it!)
    useEffect(() => {
        pickNextChallenge();
    }, []);

    //Isaac, this is for you:
    useEffect(() => {
        if (challengeData) {
            prepareOptions(challengeData);
        }
    }, [challengeData]);

    function clearNextTimer() {
        if (nextTimerRef.current) {
            clearTimeout(nextTimerRef.current);
            nextTimerRef.current = null;
        }
    }

    function handleAnswer(idx) {
        if (answerLocked) return;
        setAnswerLocked(true);

        setSelectedIdx(idx);
        const correct = (idx === falseIndex);
        const newStreak = correct ? streak + 1 : 0;
        setStreak(newStreak);

        const bonus = correct ? Math.max(newStreak - 1, 0) * 3 : 0;
        const xpAward = correct ? 10 + bonus : 4;

        setXpGain(xpAward);
        setTimeout(() => setXpGain(0), 1200);

        setStreakEvent(correct ? 'up' : 'break');
        setTimeout(() => setStreakEvent(null), 700);

        updateCompletedChallenges(correct, xpAward, newStreak);
        setFeedback(correct ? "Correct!" : "Not quite. Try again");
        setFeedbackKey(k => k + 1);

        nextTimerRef.current = setTimeout(() => {
            pickNextChallenge();
        }, 1200);
    }

    async function updateCompletedChallenges(wasCorrect = true, xpAward = 0, streakVal = 0) {
        await setDoc(doc(db, "users", user.uid, "completedChallenges", currentChallengeId),{
            challengeLevel: challengeData.level,
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

    return (
        <>
            <NavBar mode="authed" user={user} />
            <main>
                <div className={styles.question}>
                    <h1 className={styles.questionStatement}>Which one is false / more extreme?</h1>
                    <p className={styles.questionLevel}>
                        {challengeData?.level != null ? `Level ${challengeData.level}` : "Level ?"}
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

                <div className={styles.challengeGrid}>
                    {options.map((optText, idx) => {
                        //make it satisfying to click and hover over:
                        let extraClass = "";
                        if (selectedIdx !== null && idx === selectedIdx) {
                            extraClass = (idx === falseIndex) ? styles.selectedCorrect : styles.selectedWrong;
                        }
                        return (
                            <div key={idx} className={`${styles.challengeOption} ${extraClass}`}>
                                <video id={`videoPlayer${idx}`} controls loop></video>
                                <p className={styles.challengeText}>{optText}</p>
                                <button className={styles.challengeBtn} onClick={() => handleAnswer(idx)}>
                                    {idx === 0 ? "This one!" : "No, this one!"}
                                </button>
                            </div>
                        )
                    })}
                </div>

                <div className={styles.feedback}>
                    {feedback && (
                        <div key={feedbackKey} className={styles.feedbackMessage}>
                            {feedback}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

export default TwoChoiceGame;
