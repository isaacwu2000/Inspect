import React, {useState, useEffect} from 'react';
import styles from './Game.module.css';
import NavBar from './NavBar.jsx';

import { db, storage, ref, getBlob, collection, getDocs, query, orderBy } from './main.jsx';

function BinaryGame({ user }) {
    const [currentChallengeData, setCurrentChallengeData] = useState(null);
    const [currentChallengeId, setCurrentChallengeId] = useState(null);
    const [feedback, setFeedback] = useState("");

    async function getCompletedChallenges() {
        //TODO
    }

    async function updateCompletedChallenges() {
        // TODO
    }

    async function loadVideo(videoURL) {
        // fix, TODO: URL.revokeObjectURL(uri);

        const videoRef = ref(storage, videoURL)
        const blob = await getBlob(videoRef);
        const video = document.getElementById("videoPlayer");
        video.src = URL.createObjectURL(blob);
        video.play();
    }

    async function loadChallenge() {
        const challengesRef = await collection(db, "challenges");
        const qChallenges = await query(challengesRef, orderBy("level","asc"));
        const snap = await getDocs(qChallenges);
        if (snap.empty) {setChallenge(null); return;}
        // TODO: implement getCompletedChallengers() here

        const challengeSnap = snap.docs[0];
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
        setFeedback(correct ? "Correct!" : `Nope. The answer was ${currentChallengeData.factual}`); //use emojis to give ppl dopamine or punish their naughty behavior
    } 

    return (
        <>
            <NavBar mode="authed" />
            <main>
                <div className={styles.question}>
                    <h1 className={styles.questionStatement}>True or False?</h1>
                    <p className={styles.questionLevel}>
                        {currentChallengeData?.level != null ? `Level ${currentChallengeData.level}` : "Level ?"}
                    </p>
                </div>

                <div className={styles.singleCardWrapper}>
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
