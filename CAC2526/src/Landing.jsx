// Landing.jsx
import React, { useEffect, useRef } from 'react';
import googleLogo from '/src/assets/google.svg';
import NavBar from './NavBar.jsx';
import EyeLogo from './EyeLogo.jsx';
import { signInWithPopup, auth, provider } from './main.jsx';
import styles from './Landing.module.css';

function Landing({ isLoggedIn, user }){
    const modesRef = useRef(null);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, []);

    async function handleSignIn() {
        await signInWithPopup(auth, provider);
    }

    function scrollToModes(e) {
        e.preventDefault();
        if (!modesRef.current) return;
        const rect = modesRef.current.getBoundingClientRect();
        const target = rect.top + window.scrollY - (window.innerHeight - rect.height) / 2;
        window.scrollTo({
            top: Math.max(target, 0),
            behavior: 'smooth'
        });
    }

    const steps = [
        {
            title: "Read the claim",
            copy: "A headline, quote, or image caption pulled from real news and AI-generated rumors."
        },
        {
            title: "Make the call",
            copy: "Choose whether it's factual or fabricated — or pick which of two statements is real."
        },
        {
            title: "See the receipts",
            copy: "Instant feedback with sourcing so you learn which signals exposed the lie."
        }
    ];

    const reasons = [
        "Bite-size rounds finish in under a minute.",
        "Ground-truth answers backed by reputable sources.",
        "Track streaks and accuracy to watch your skill grow.",
        "Built for phones first — perfect for quick reps."
    ];

    return(
        <>
            <NavBar mode={isLoggedIn ? "authed" : "public"} user={user} />
            <main className={styles.landingMain}>
                <section className={`${styles.section} ${styles.hero}`}>
                    <div className={styles.heroGrid}>
                        <div className={styles.heroCopy}>
                            <p className={styles.kicker}>Build your fact-checking reflex</p>
                            <h1 className={styles.heroTitle}>
                                Learn to separate <u>truth</u> from disinformation
                            </h1>
                            <p className={styles.lead}>
                                Train with real headlines and AI-generated hoaxes.
                                Quick rounds, instant receipts, and feedback that sticks.
                            </p>
                            <div className={styles.ctaRow}>
                                <button onClick={handleSignIn} className={styles.googleBtn}>
                                    <img className={styles.googleLogo} src={googleLogo} alt="Google logo"/>
                                    <span>Sign in with Google</span>
                                </button>
                                <a className={styles.secondaryBtn} href="#modes" onClick={scrollToModes}>
                                    Preview the modes
                                </a>
                            </div>
                        </div>

                        <div className={styles.heroCard}>
                            <EyeLogo size={96} animated={true} />
                            <ul className={styles.heroList}>
                                <li>Short, swipeable questions</li>
                                <li>Real-world political, health, and tech topics</li>
                                <li>No data sales — only practice streaks</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section id="modes" ref={modesRef} className={`${styles.section} ${styles.modesSection}`}>
                    <h2>Two ways to train</h2>
                    <p className={styles.sectionLead}>
                        Pick the challenge that matches how you spot lies in the wild.
                    </p>
                    <div className={styles.cardGrid}>
                        <div className={styles.card}>
                            <h3>True or False?</h3>
                            <p>
                                Face a single claim and decide if it's legit or fabricated.
                                Perfect for sharpening gut checks against viral posts.
                            </p>
                        </div>
                        <div className={styles.card}>
                            <h3>Which one?</h3>
                            <p>
                                Two statements enter, one is real. Compare phrasing, numbers, and tone to spot the fake.
                            </p>
                        </div>
                    </div>
                </section>

                <section className={`${styles.section} ${styles.band}`}>
                    <h2>How Inspect works</h2>
                    <div className={styles.stepGrid}>
                        {steps.map((step, idx) => (
                            <div className={styles.stepCard} key={step.title}>
                                <span className={styles.stepNumber}>{idx + 1}</span>
                                <h3>{step.title}</h3>
                                <p>{step.copy}</p>
                            </div>
                        ))}
                    </div>
                </section>

                    <section className={styles.section}>
                        <h2>Why you'll get better fast</h2>
                        <div className={styles.pillGrid}>
                            {reasons.map(reason => (
                                <div className={styles.pill} key={reason}>{reason}</div>
                            ))}
                        </div>
                    </section>

                <section className={`${styles.section} ${styles.accentPanel}`}>
                    <h2>Who we are</h2>
                    <p className={styles.sectionLead}>
                        We're Isaac and Santi, two high-school sophomores from Massachusetts.
                        We built Inspect because AI-generated misinformation is everywhere —
                        and we want everyone to recognize it at a glance.
                    </p>
                </section>

                <section className={`${styles.section} ${styles.band}`}>
                    <h2>Acknowledgements</h2>
                    <p className={styles.sectionLead}>
                        Huge thanks to the <a target="_blank" href="https://www.flintk12.com/">Flint</a> team for sponsoring API credits,
                        writers from <a target="_blank" href="https://themiltonpaper.com/">The Milton Paper</a> for letting us use their articles,
                        and the <a target="_blank" href="https://www.congressionalappchallenge.us/">Congressional App Challenge</a> team for organizing the challenge.
                    </p>
                </section>

                <section className={`${styles.section} ${styles.ctaSection}`}>
                    <h2>Ready to try Inspect?</h2>
                    <p className={styles.sectionLead}>
                        Start a round, get instant feedback, and build a streak of correct calls.
                    </p>
                    <div className={styles.ctaRow}>
                        <button onClick={handleSignIn} className={styles.googleBtn}>
                            <img className={styles.googleLogo} src={googleLogo} alt="Google logo"/>
                            <span>Sign in with Google</span>
                        </button>
                        <a className={styles.secondaryBtn} href="#modes" onClick={scrollToModes}>
                            See the modes first
                        </a>
                    </div>
                </section>
            </main>
        </>
    );
}

export default Landing;
