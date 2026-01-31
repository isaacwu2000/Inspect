import React, { useEffect, useState } from 'react';
import NavBar from './NavBar.jsx';
import EyeLogo from './EyeLogo.jsx';
import styles from './Profile.module.css';
import { db, doc, getDoc, setDoc } from './main.jsx';

const LEVELS = [
  { xp: 0, title: "Amateur Identifier" },
  { xp: 100, title: "Rumor Wrangler" },
  { xp: 250, title: "Fact Wrangler" },
  { xp: 500, title: "Signal Seeker" },
  { xp: 900, title: "Disinfo Slayer" }
];

function getLevel(xp = 0) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xp) current = lvl;
  }
  const next = LEVELS.find(l => l.xp > xp);
  const xpInto = xp - current.xp;
  const xpToNext = next ? next.xp - current.xp : null;
  return { current, next, xpInto, xpToNext };
}

function Profile({ user }) {
  const [profile, setProfile] = useState({ xp: 0, answers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setProfile({ xp: snap.data().xp || 0, answers: snap.data().answers || 0 });
      } else {
        await setDoc(userRef, {
          displayName: user.displayName,
          email: user.email,
          xp: 0,
          answers: 0
        });
        setProfile({ xp: 0, answers: 0 });
      }
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  const { current, next, xpInto, xpToNext } = getLevel(profile.xp);
  const progress = next ? Math.min(1, xpInto / xpToNext) : 1;

  return (
    <>
      <NavBar mode="authed" user={user} />
      <main className={styles.profileMain}>
        <section className={styles.headerCard}>
          <div className={styles.avatarWrap}>
            {user?.photoURL ? (
              <img src={user.photoURL} className={styles.avatar} alt="Profile" />
            ) : (
              <div className={styles.avatarFallback}>{user?.displayName?.[0]?.toUpperCase() || "?"}</div>
            )}
          </div>
          <div className={styles.headerCopy}>
            <p className={styles.kicker}>Your profile</p>
            <h1 className={styles.name}>{user?.displayName || "Anonymous"}</h1>
            <p className={styles.levelTitle}>{current.title}</p>
          </div>
          <EyeLogo size={72} animated={true} />
        </section>

        <section className={styles.statsCard}>
          <div className={styles.statBlock}>
            <p className={styles.statLabel}>XP</p>
            <p className={styles.statValue}>{profile.xp}</p>
          </div>
          <div className={styles.statBlock}>
            <p className={styles.statLabel}>Questions answered</p>
            <p className={styles.statValue}>{profile.answers}</p>
          </div>
          <div className={styles.progressWrap}>
            <div className={styles.progressTop}>
              <span>{current.title}</span>
              <span>{next ? next.title : "Max level"}</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
            </div>
            <div className={styles.progressNums}>
              <span>{current.xp} xp</span>
              <span>{next ? `${next.xp} xp` : "∞"}</span>
            </div>
          </div>
        </section>

        <section className={styles.levelList}>
          <h2>Level ladder</h2>
          <div className={styles.levelGrid}>
            {LEVELS.map(lvl => (
              <div key={lvl.title} className={styles.levelItem}>
                <p className={styles.levelName}>{lvl.title}</p>
                <p className={styles.levelReq}>{lvl.xp} xp</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export default Profile;
