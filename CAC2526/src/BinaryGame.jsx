import React, {useState, useEffect} from 'react';
import styles from './Game.module.css';
import NavBar from './NavBar.jsx';

import {
    db,
    collection, getDocs, query, orderBy
} from './main.jsx';

function BinaryGame({ user }) {
    const [challenge, setChallenge] = useState(null);
    const [selected, setSelected] = useState(null); //"real or fake lookin ahh"
    const [feedback, setFeedback] = useState("");

    async function loadChallenge() {
        const challengesRef = collection(db, "binaryChallenges");
        const qChallenges = query(challengesRef, orderBy("level","asc"));
        const snap = await getDocs(qChallenges);

        if (snap.empty) {
            setChallenge(null);
            return;
        }

        //Santi: Isaac you'll probably want to replace this later with your "AI ADAPTIVE DIFFICULTY SCALING OMG OMG OMG":
        //This picks a challenge at RANDOM (omg he said random could you imagine being that basic)
        const docsArr = snap.docs;
        const randDoc = docsArr[Math.floor(Math.random()*docsArr.length)];
        const data = randDoc.data();

        setChallenge({
            id: randDoc.id,
            level: data.level,
            promptText: data.promptText,
            isTrue: !!data.isTrue
        });
        setSelected(null);
        setFeedback("");
    }

    useEffect(() => {
        loadChallenge();
    }, []);

    function guessRealOrFake(guessIsReal) {
        if (!challenge) return;

        const correct = (guessIsReal === challenge.isTrue);
        setSelected(guessIsReal ? "real" : "fake");
        setFeedback(correct ? "Correct ✅" : "Nope ❌"); //use emojis to give ppl dopamine or punish their naughty behavior
    }

    async function handleNext() {
        await loadChallenge();
    }

    const levelText = challenge?.level != null ? `Level ${challenge.level}` : "Level ?";

    return (
        <>
            <NavBar mode="authed" />
            <main>
                <div className={styles.question}>
                    <h1 className={styles.questionStatement}>Real or AI?</h1>
                    <p className={styles.questionLevel}>{levelText}</p>
                </div>

                <div className={styles.singleCardWrapper}>
                    <div className={styles.singleCard}>
                        <p className={styles.singlePrompt}>
                            {challenge?.promptText || "No challenge available."}
                        </p>

                        <div className={styles.binaryBtnRow}>
                            <button 
                                className={styles.binaryBtn}
                                onClick={() => guessRealOrFake(true)}
                            >
                                Real
                            </button>

                            <button 
                                className={styles.binaryBtn}
                                onClick={() => guessRealOrFake(false)}
                            >
                                Fake / AI
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.feedback}>
                    {feedback && <div>{feedback}</div>}
                    {feedback && (
                        <button className={styles.nextBtn} onClick={handleNext}>
                            Next one →
                        </button>
                    )}
                </div>
            </main>
        </>
    )
}

export default BinaryGame;
