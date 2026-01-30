import React, { useEffect, useRef } from 'react';
import Hero from '../components/Hero';
import gateImage from '../assets/gate-view.png';
import '../components/Socials.css';

const Home = () => {
    const contentRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = contentRef.current.querySelectorAll('.fade-in');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={contentRef}>
            <Hero />

            <div className="social-links-bar fade-in visible">
                <a href="https://discord.gg/QjJDABk9Nh" target="_blank" rel="noopener noreferrer" className="social-link discord">
                    Join our Discord
                </a>
                <a href="https://www.roblox.com/es/communities/33295484" target="_blank" rel="noopener noreferrer" className="social-link roblox">
                    Join Roblox Group
                </a>
            </div>

            <section className="container section-padding" style={{ padding: '4rem 1rem' }}>
                <h2 className="section-title fade-in" style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
                    Why Fly Tre Air?
                </h2>

                <div className="features-grid fade-in">
                    <div className="glass-card feature-card">
                        <h3>Premium Fleet</h3>
                        <p>Our fleet consists of the latest aircraft, ensuring a comfortable and realistic journey across the skies.</p>
                    </div>
                    <div className="glass-card feature-card">
                        <h3>Exceptional Service</h3>
                        <p>Our crew is trained to provide the best roleplay experience, from check-in to landing.</p>
                    </div>
                    <div className="glass-card feature-card">
                        <h3>Global Destinations</h3>
                        <p>Explore a variety of destinations. Our flight schedule is updated regularly with new routes.</p>
                    </div>
                </div>
            </section>

            <section className="showcase-section fade-in" style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${gateImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '6rem 1rem',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Join the Team</h2>
                    <p style={{ maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1.1rem' }}>
                        Looking for a career in aviation? We are hiring pilots, cabin crew, and ground staff.
                    </p>
                    <a href="/recruitment" className="btn">Apply Now</a>
                </div>
            </section>

            <style jsx>{`
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }
        .feature-card h3 {
          color: var(--color-primary-light);
          margin-bottom: 1rem;
        }
        .feature-card p {
          line-height: 1.6;
          color: rgba(255,255,255,0.8);
        }
      `}</style>
        </div>
    );
};

export default Home;
