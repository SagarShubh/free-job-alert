import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className="container">
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
            Government Job Portal
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--secondary)' }}>
            Welcome to the future of job hunting. Clean, Fast, Reliable.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-primary">Browse Jobs</button>
          </div>
        </div>
      </main>
    </div>
  );
}
