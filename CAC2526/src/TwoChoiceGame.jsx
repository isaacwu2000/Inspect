import React, {useState, useEffect} from 'react';
import styles from './Game.module.css';
import NavBar from './NavBar.jsx';

import { auth, db, signOut, storage, ref, getBlob, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy } from './main.jsx';

function TwoChoiceGame({ user }){
    const [currentChallengeId, setCurrentChallengeId] = useState(null);
    const [challengeData, setChallengeData] = useState(null);
    const [options, setOptions] = useState([]); //[textA, textB]
    const [falseIndex, setFalseIndex] = useState(null); //Santi: index of the FALSE statement
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [feedback, setFeedback] = useState("");

    async function ensureUserExists() {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
            await setDoc(userRef, {
                displayName: user.displayName,
                email: user.email
            });
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
        // get next unseen challenge (or fallback first)
        const completed = await getCompletedChallenges();
        const challengesRef = collection(db, "challenges");
        const qChallenges = query(challengesRef, orderBy("level", "asc"), where("level", "==", 67));
        const qSnap = await getDocs(qChallenges);

        let chosenDoc = qSnap.docs.find(d => !completed.includes(d.id));
        console.log(chosenDoc.data());
        if (!chosenDoc) {
            // Santi fallback option: just take first doc
            chosenDoc = qSnap.docs[0];
        }
        if (!chosenDoc) {
            // If Isaac forgot to put more challenges: (hopefully not)
            setCurrentChallengeId(null);
            setChallengeData(null);
            return;
        }

        setCurrentChallengeId(chosenDoc.id);
        setChallengeData(chosenDoc.data());
        setSelectedIdx(null);
        setFeedback("");
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

    function handleAnswer(idx) {
        setSelectedIdx(idx);
        const correct = (idx === falseIndex);
        setFeedback(correct ? "Correct!" : "Not quite. Try again");
    }

    async function handleNext() {
        await pickNextChallenge();
    }

    async function updateCompletedChallenges() {
        //TODO
    }

    return (
        <>
            <NavBar mode="authed" />
            <main>
                <div className={styles.question}>
                    <h1 className={styles.questionStatement}>Which one is false / more extreme?</h1>
                    <p className={styles.questionLevel}>
                        Level 3
                    </p>
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
                    {feedback && <div>{feedback}</div>}
                    {feedback && (
                        <button className={styles.nextBtn} onClick={() => handleNext()}>Continue →</button>
                    )}
                </div>
            </main>
        </>
    );
}

export default TwoChoiceGame;
