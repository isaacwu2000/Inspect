import React, {useState, useEffect, useRef} from 'react';
import styles from './Game.module.css';
import NavBar from './NavBar.jsx';
import EyeLogo from './EyeLogo.jsx';
import { db, storage, ref, getBlob, collection, doc, setDoc, getDocs, query, where, orderBy, increment } from './firebase.js';

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
    const seenRef = useRef(new Set());
    const [videoSrcs, setVideoSrcs] = useState([null,null]);
    const videoUrlRefs = useRef([null,null]);
    const videoLoadTokenRef = useRef(0);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [level, setLevel] = useState(1);
    const [levelUp, setLevelUp] = useState(false);
    const visibleOptions = options.length > 0 ? options : [null, null];

    async function loadVideos(videoURLs) {
        // videoURLs is [urlForOption0, urlForOption1] matching current option order
        clearVideos();
        const loadToken = videoLoadTokenRef.current;

        const blobs = await Promise.all(videoURLs.map(async (url) => {
            if (!url) return null;
            const storageRef = ref(storage, url);
            const blob = await getBlob(storageRef);
            const objUrl = URL.createObjectURL(blob);
            return objUrl;
        }));

        if (loadToken !== videoLoadTokenRef.current) {
            blobs.forEach((objUrl) => {
                if (objUrl) URL.revokeObjectURL(objUrl);
            });
            return;
        }

        videoUrlRefs.current = blobs;
        setVideoSrcs(blobs);
    }

    function clearVideos() {
        videoLoadTokenRef.current += 1;
        videoUrlRefs.current.forEach((videoUrl, idx) => {
            if (videoUrl) {
                URL.revokeObjectURL(videoUrl);
                videoUrlRefs.current[idx] = null;
            }
        });
        setVideoSrcs([null, null]);
    }

    async function pickNextChallenge() {
        clearNextTimer();
        setAnswerLocked(false);
        setSelectedIdx(null);
        setOptions([]);
        setFalseIndex(null);
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

        setCurrentChallengeId(chosenDoc.id);
        setChallengeData(chosenDoc.data());
    }

    // Shuffle two options but make sure that we remember which one is false.
    async function prepareOptions(data) {
        const pair = [
            { text: data.optionTrue, isFalse: false, video: data.videoTrue },
            { text: data.optionFalse, isFalse: true, video: data.videoFalse }
        ];

        //Shuffel time!!!!
        pair.sort(() => Math.random() - 0.5);

        const texts = pair.map(p => p.text);
        const idxFalse = pair.findIndex(p => p.isFalse === true);
        const videosOrdered = pair.map(p => p.video);

        setOptions(texts);
        setFalseIndex(idxFalse);

        await loadVideos(videosOrdered);
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
        if (!correct) {
            clearVideos();
            setOptions([]);
            setFalseIndex(null);
            setSelectedIdx(null);
        }

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

                <div className={styles.challengeGrid}>
                    {visibleOptions.map((optText, idx) => {
                        //make it satisfying to click and hover over:
                        let extraClass = "";
                        if (selectedIdx !== null && idx === selectedIdx) {
                            extraClass = (idx === falseIndex) ? styles.selectedCorrect : styles.selectedWrong;
                        }
                        return (
                            <div key={idx} className={`${styles.challengeOption} ${extraClass}`}>
                                {videoSrcs[idx] ? (
                                    <video id={`videoPlayer${idx}`} controls loop src={videoSrcs[idx]}></video>
                                ) : (
                                    <div className={styles.videoPlaceholder}>Loading video…</div>
                                )}
                                <p className={styles.challengeText}>{optText ?? "Loading challenge…"}</p>
                                <button className={styles.challengeBtn} onClick={() => handleAnswer(idx)} disabled={optText == null}>
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
