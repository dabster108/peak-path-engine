import { useScrollAnimations } from "../hooks/useScrollAnimations";
import "./About.css";

const team = [
  {
    name: "Arjun Mehta",
    role: "Founder & CEO",
    gradient: "linear-gradient(135deg, #1B4332, #0d2b1e)",
  },
  {
    name: "Priya Sharma",
    role: "Head of Design",
    gradient: "linear-gradient(135deg, #3b1f5e, #1e1b4b)",
  },
  {
    name: "Vikram Patel",
    role: "Chief of Expeditions",
    gradient: "linear-gradient(135deg, #92400e, #744210)",
  },
  {
    name: "Ananya Singh",
    role: "Sustainability Lead",
    gradient: "linear-gradient(135deg, #1e3a5f, #1B4332)",
  },
];

const values = [
  {
    icon: "⛰",
    title: "Built for the Mountains",
    desc: "Every product is tested at altitude by real mountaineers before it reaches your hands.",
  },
  {
    icon: "🌿",
    title: "Responsibly Made",
    desc: "Bluesign® certified fabrics, recycled insulation, and carbon-neutral manufacturing.",
  },
  {
    icon: "🤝",
    title: "Community First",
    desc: "We give 1% of every sale to Himalayan trail conservation and local guide welfare programs.",
  },
  {
    icon: "🔧",
    title: "Built to Last",
    desc: "We repair before we replace. Our lifetime guarantee means gear that lasts like the mountains.",
  },
];

const milestones = [
  { year: "2011", event: "Founded in Manali, Himachal Pradesh" },
  { year: "2013", event: "First summit: Stok Kangri expedition kit" },
  { year: "2016", event: "Launched women's collection" },
  { year: "2019", event: "Reached 1 lakh customers across India" },
  { year: "2022", event: "Expanded to 15 countries in Asia & Europe" },
  { year: "2024", event: "Launched SHIKHAR Renewable gear program" },
  { year: "2026", event: "Present — 1M+ adventurers and climbing strong" },
];

export default function About() {
  useScrollAnimations();

  return (
    <main className="about-page">
      {/* ====== HERO ====== */}
      <section className="about-hero">
        <div className="about-hero__bg" />
        <div className="container">
          <span className="section-label">Our Story</span>
          <h1 className="about-hero__title">
            Born at&nbsp;<span className="text-amber">The Base</span> of
            <br />
            Every Summit.
          </h1>
          <p className="about-hero__sub">
            SHIKHAR OUTDOOR was born from a simple frustration: gear that wasn't
            built for the places we actually climbed. So we built our own.
          </p>
        </div>
        <div className="about-hero__bottom">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" fill="none">
            <path
              d="M0 80L240 20L480 55L720 5L960 45L1200 15L1440 50V80H0Z"
              fill="#FAF7F2"
            />
          </svg>
        </div>
      </section>

      {/* ====== BRAND STORY ====== */}
      <section className="about-story section-pad">
        <div className="container">
          <div className="about-story__grid">
            <div className="about-story__text">
              <span className="section-label reveal">How It Started</span>
              <div className="heading-reveal">
                <h2 className="heading-reveal-inner">
                  A Pack, a Peak,
                  <br />
                  and a Promise.
                </h2>
              </div>
              <p className="reveal" style={{ transitionDelay: "0.1s" }}>
                In 2011, our founder Arjun Mehta stood at the base of Stok
                Kangri with a jacket that had failed him for the third time.
                Instead of blaming the mountain, he flew home and started
                SHIKHAR from a garage in Manali.
              </p>
              <p className="reveal" style={{ transitionDelay: "0.2s" }}>
                The name says it all — Shikhar means "peak" or "summit" in
                Hindi. Every product we make carries that intent: to get you
                there, and bring you back.
              </p>
              <p className="reveal" style={{ transitionDelay: "0.3s" }}>
                Today, SHIKHAR gear has been trusted on Everest base camps,
                Kilimanjaro ascents, Andean treks, and weekend trails across 50+
                countries.
              </p>
            </div>
            <div className="about-story__visual reveal-scale">
              <div className="about-visual-card">
                <svg
                  viewBox="0 0 400 340"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="400" height="340" fill="url(#storyGrad)" />
                  <path
                    d="M0 340L80 180L160 260L240 100L320 200L400 140V340H0Z"
                    fill="rgba(255,255,255,0.06)"
                  />
                  <path
                    d="M0 340L100 200L200 280L300 120L400 190V340H0Z"
                    fill="rgba(255,255,255,0.04)"
                  />
                  <path
                    d="M240 100L270 160L265 150L300 190L240 100Z"
                    fill="rgba(255,255,255,0.18)"
                  />
                  <text
                    x="200"
                    y="310"
                    textAnchor="middle"
                    fill="rgba(217,119,6,0.5)"
                    fontFamily="Playfair Display"
                    fontSize="10"
                    letterSpacing="6"
                  >
                    EST. MANALI 2011
                  </text>
                  <defs>
                    <linearGradient
                      id="storyGrad"
                      x1="0"
                      y1="0"
                      x2="400"
                      y2="340"
                    >
                      <stop offset="0%" stopColor="#1B4332" />
                      <stop offset="100%" stopColor="#0d2b1e" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="about-visual-card__label">
                  <span>Stok Kangri, 2011</span>
                  <span>Where it all began</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== VALUES ====== */}
      <section
        className="about-values section-pad"
        style={{ background: "var(--color-gray-100)" }}
      >
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">What We Stand For</span>
            <div className="heading-reveal">
              <h2 className="heading-reveal-inner">Our Core Values</h2>
            </div>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="value-card reveal"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="value-icon">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TIMELINE ====== */}
      <section className="about-timeline section-pad">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">Our Journey</span>
            <div className="heading-reveal">
              <h2 className="heading-reveal-inner">
                Milestones on the Summit Trail
              </h2>
            </div>
          </div>
          <div className="timeline">
            {milestones.map((m, i) => (
              <div
                key={m.year}
                className={`timeline-item reveal ${i % 2 === 0 ? "left" : "right"}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="timeline-content">
                  <span className="timeline-year">{m.year}</span>
                  <p>{m.event}</p>
                </div>
                <div className="timeline-dot" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TEAM ====== */}
      <section
        className="about-team section-pad"
        style={{ background: "var(--color-gray-100)" }}
      >
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">The People</span>
            <div className="heading-reveal">
              <h2 className="heading-reveal-inner">The Summit Crew</h2>
            </div>
          </div>
          <div className="team-grid">
            {team.map((member, i) => (
              <div
                key={member.name}
                className="team-card reveal"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div
                  className="team-card__avatar"
                  style={{ background: member.gradient }}
                >
                  <svg viewBox="0 0 120 120" fill="none">
                    <circle
                      cx="60"
                      cy="45"
                      r="22"
                      fill="rgba(255,255,255,0.2)"
                    />
                    <ellipse
                      cx="60"
                      cy="100"
                      rx="30"
                      ry="20"
                      fill="rgba(255,255,255,0.1)"
                    />
                  </svg>
                </div>
                <div className="team-card__info">
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== SUSTAINABILITY ====== */}
      <section className="about-sustainability section-pad">
        <div className="container">
          <div className="sustainability-inner">
            <div className="sustainability-text reveal-left">
              <span className="section-label">Planet First</span>
              <div className="heading-reveal">
                <h2 className="heading-reveal-inner">
                  Adventure Without
                  <br />
                  <span className="text-amber">Compromise.</span>
                </h2>
              </div>
              <p>
                Our Himalayan Pledge commits to net-zero emissions by 2030,
                using 100% recycled or bluesign® certified materials across our
                full range by 2027.
              </p>
              <div className="sustainability-stats">
                <div className="sus-stat">
                  <strong>68%</strong>
                  <span>Recycled materials used in 2025</span>
                </div>
                <div className="sus-stat">
                  <strong>42K+</strong>
                  <span>Items repaired instead of replaced</span>
                </div>
                <div className="sus-stat">
                  <strong>₹2.4Cr</strong>
                  <span>Donated to trail conservation</span>
                </div>
              </div>
            </div>
            <div
              className="sustainability-visual reveal-scale"
              style={{ transitionDelay: "0.2s" }}
            >
              <div className="sus-visual-circle">
                <svg viewBox="0 0 300 300" fill="none">
                  <circle
                    cx="150"
                    cy="150"
                    r="140"
                    stroke="rgba(27,67,50,0.15)"
                    strokeWidth="1"
                  />
                  <circle
                    cx="150"
                    cy="150"
                    r="110"
                    stroke="rgba(27,67,50,0.2)"
                    strokeWidth="1"
                  />
                  <circle
                    cx="150"
                    cy="150"
                    r="80"
                    stroke="rgba(27,67,50,0.25)"
                    strokeWidth="1"
                    strokeDasharray="6 4"
                  />
                  <path
                    d="M150 10L165 80L220 30L175 90L230 100L175 110L220 170L165 120L150 190L135 120L80 170L125 110L70 100L125 90L80 30L135 80Z"
                    fill="rgba(27,67,50,0.12)"
                    stroke="rgba(27,67,50,0.4)"
                    strokeWidth="1"
                  />
                  <circle cx="150" cy="150" r="12" fill="var(--color-forest)" />
                  <circle cx="150" cy="150" r="6" fill="var(--color-amber)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
