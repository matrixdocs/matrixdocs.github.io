import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

// Hero Section
function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBackground}>
        <div className={styles.gridPattern}></div>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
      </div>
      <div className={styles.heroContent}>
        <div className={styles.heroTag}>
          <span className={styles.tagIcon}>◆</span>
          Independent · Unofficial
        </div>
        <h1 className={styles.heroTitle}>
          Master the <span className={styles.highlight}>Matrix</span> Protocol
        </h1>
        <p className={styles.heroSubtitle}>
          An independent, unofficial guide to the open standard for decentralised, secure,
          real-time communication. For the normative source, read the{' '}
          <a href="https://spec.matrix.org/">official specification</a>.
        </p>
        <div className={styles.heroButtons}>
          <Link to="/docs/getting-started/introduction" className={styles.primaryButton}>
            Get Started
            <span className={styles.buttonArrow}>→</span>
          </Link>
          <Link to="/docs/getting-started/quick-start" className={styles.secondaryButton}>
            Quick Start Guide
          </Link>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.statValue}>Open</span>
            <span className={styles.statLabel}>Standard</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.heroStat}>
            <span className={styles.statValue}>Federated</span>
            <span className={styles.statLabel}>Anyone can run a server</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.heroStat}>
            <span className={styles.statValue}>E2EE</span>
            <span className={styles.statLabel}>Olm/Megolm</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Features data
const features = [
  {
    icon: '🔐',
    title: 'End-to-End Encrypted',
    description: "Olm and Megolm encrypt messages end to end. In encrypted rooms, only participants' devices can read them.",
    link: '/docs/security/overview',
  },
  {
    icon: '🌐',
    title: 'Decentralized & Federated',
    description: 'Run your own server or join an existing one. Servers federate, so users on different servers share the same rooms.',
    link: '/docs/getting-started/concepts',
  },
  {
    icon: '🔗',
    title: 'Bridges',
    description: 'Bridges link Matrix rooms to Discord, Telegram, Slack, IRC, Signal, WhatsApp and more. Quality varies by network.',
    link: '/docs/bridges/overview',
  },
  {
    icon: '🤖',
    title: 'Powerful Bots',
    description: 'Automate workflows, moderate communities, and extend functionality with the rich bot ecosystem.',
    link: '/docs/bots/overview',
  },
  {
    icon: '🛠️',
    title: 'Developer Friendly',
    description: 'SDKs for JavaScript, Rust, Python, Go and more. Build apps, bots, and integrations with ease.',
    link: '/docs/sdks/overview',
  },
  {
    icon: '📖',
    title: 'Open Standard',
    description: 'A public, versioned specification, changed through an open proposal process (MSCs).',
    link: '/docs/specification/overview',
  },
];

function FeaturesSection() {
  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Why Matrix?</span>
          <h2 className={styles.sectionTitle}>Built for the Future of Communication</h2>
          <p className={styles.sectionSubtitle}>
            Matrix combines the best of decentralized architecture with modern messaging features
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <Link to={feature.link} key={idx} className={styles.featureCard}>
              <span className={styles.featureIcon}>{feature.icon}</span>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
              <span className={styles.featureLink}>
                Learn more <span>→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Ecosystem data
const ecosystemItems = [
  { category: 'Clients', items: ['Element', 'Cinny', 'FluffyChat', 'Nheko', 'SchildiChat'], link: '/docs/clients/overview' },
  { category: 'Servers', items: ['Synapse', 'Continuwuity', 'Tuwunel', 'Dendrite'], link: '/docs/servers/overview' },
  { category: 'Bridges', items: ['Discord', 'Telegram', 'Slack', 'IRC', 'WhatsApp'], link: '/docs/bridges/overview' },
  { category: 'SDKs', items: ['matrix-js-sdk', 'matrix-rust-sdk', 'matrix-nio', 'mautrix'], link: '/docs/sdks/overview' },
];

function EcosystemSection() {
  return (
    <section className={styles.ecosystem}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Ecosystem</span>
          <h2 className={styles.sectionTitle}>A Thriving Open Source Community</h2>
          <p className={styles.sectionSubtitle}>
            Clients, servers, bridges and tools built on one open specification
          </p>
        </div>
        <div className={styles.ecosystemGrid}>
          {ecosystemItems.map((eco, idx) => (
            <Link to={eco.link} key={idx} className={styles.ecosystemCard}>
              <h3 className={styles.ecosystemCategory}>{eco.category}</h3>
              <div className={styles.ecosystemItems}>
                {eco.items.map((item, i) => (
                  <span key={i} className={styles.ecosystemItem}>{item}</span>
                ))}
              </div>
              <span className={styles.ecosystemLink}>View all →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Quick start paths
const paths = [
  {
    title: 'I want to use Matrix',
    description: 'Set up your account and start chatting in minutes',
    icon: '💬',
    link: '/docs/getting-started/quick-start',
    color: 'green',
  },
  {
    title: 'I want to run a server',
    description: 'Deploy your own homeserver for full control',
    icon: '🖥️',
    link: '/docs/deployment/overview',
    color: 'blue',
  },
  {
    title: 'I want to build apps',
    description: 'Create bots, clients, and integrations',
    icon: '⚡',
    link: '/docs/sdks/overview',
    color: 'purple',
  },
  {
    title: 'I want to bridge platforms',
    description: 'Connect Matrix to Discord, Telegram, and more',
    icon: '🌉',
    link: '/docs/bridges/overview',
    color: 'orange',
  },
];

function PathsSection() {
  return (
    <section className={styles.paths}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Choose Your Path</span>
          <h2 className={styles.sectionTitle}>What Do You Want to Do?</h2>
        </div>
        <div className={styles.pathsGrid}>
          {paths.map((path, idx) => (
            <Link to={path.link} key={idx} className={`${styles.pathCard} ${styles[`pathCard${path.color}`]}`}>
              <span className={styles.pathIcon}>{path.icon}</span>
              <h3 className={styles.pathTitle}>{path.title}</h3>
              <p className={styles.pathDescription}>{path.description}</p>
              <span className={styles.pathLink}>Start here →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className={styles.cta}>
      <div className={styles.ctaBackground}>
        <div className={styles.ctaGradient}></div>
      </div>
      <div className={styles.ctaContent}>
        <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
        <p className={styles.ctaSubtitle}>
          Read the guides, then check them against the official spec and project docs
        </p>
        <div className={styles.ctaButtons}>
          <Link to="/docs/getting-started/introduction" className={styles.ctaPrimaryButton}>
            Read the Docs
          </Link>
          <a href="https://github.com/matrixdocs/matrixdocs.github.io/issues" className={styles.ctaSecondaryButton} target="_blank" rel="noopener noreferrer">
            Report an error
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Home(): React.JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Unofficial Matrix guide"
      description="An independent, unofficial guide to the Matrix protocol and its ecosystem. Not affiliated with the Matrix.org Foundation or Element.">
      <main className={styles.main}>
        <HeroSection />
        <FeaturesSection />
        <PathsSection />
        <EcosystemSection />
        <CTASection />
      </main>
    </Layout>
  );
}
