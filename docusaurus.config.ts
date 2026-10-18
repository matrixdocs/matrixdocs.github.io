import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Matrix Docs',
  tagline: 'An independent, unofficial guide to the Matrix protocol and its ecosystem',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],

  url: 'https://matrixdocs.github.io',
  baseUrl: '/',
  organizationName: 'matrixdocs',
  projectName: 'matrixdocs.github.io',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  headTags: [
    // Preconnect to external resources
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://fonts.googleapis.com'}},
    // Theme color for browser UI
    {tagName: 'meta', attributes: {name: 'theme-color', content: '#0DBD8B'}},
    // Apple touch icon
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', href: '/img/matrix-logo.svg'}},
    // Canonical structured data
    {
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Matrix Docs',
        url: 'https://matrixdocs.github.io',
        description: 'An independent, unofficial guide to the Matrix protocol and its ecosystem. Not affiliated with the Matrix.org Foundation or Element.',
        publisher: {
          '@type': 'Organization',
          name: 'matrixdocs contributors',
        },
      }),
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          showLastUpdateTime: true,
          editUrl: 'https://github.com/matrixdocs/matrixdocs.github.io/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/matrix-social-card.png',
    // Note: Social card image should be 1200x630 PNG for best compatibility

    metadata: [
      // Basic meta
      {name: 'keywords', content: 'matrix, protocol, decentralized, chat, element, synapse, federation, bridges, bots, encryption, e2ee'},
      {name: 'author', content: 'matrixdocs contributors'},
      {name: 'robots', content: 'index, follow'},
      // Open Graph
      {property: 'og:type', content: 'website'},
      {property: 'og:site_name', content: 'Matrix Docs'},
      {property: 'og:locale', content: 'en_US'},
      // Twitter Card
      {name: 'twitter:card', content: 'summary_large_image'},
    ],

    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },

    announcementBar: {
      id: 'unofficial-2026-10',
      content: 'Unofficial, independent guide, not affiliated with the Matrix.org Foundation or Element. First drafted with AI in January 2026, then verified page by page in October 2026 against <a href="https://spec.matrix.org/v1.19/">spec v1.19</a> and <a href="https://element-hq.github.io/synapse/latest/">Synapse 1.163</a>. When in doubt, the official docs win. <a href="/docs/about">About this site</a>',
      backgroundColor: '#fff3cd',
      textColor: '#3d2e00',
      isCloseable: false,
    },

    navbar: {
      title: 'Matrix Docs',
      logo: {
        alt: 'Matrix Logo',
        src: 'img/matrix-logo.svg',
        width: 32,
        height: 32,
      },
      items: [
        {
          to: '/docs/getting-started/introduction',
          label: 'Getting Started',
          position: 'left',
        },
        {
          to: '/docs/clients/overview',
          label: 'Clients',
          position: 'left',
        },
        {
          to: '/docs/servers/overview',
          label: 'Servers',
          position: 'left',
        },
        {
          type: 'dropdown',
          label: 'Ecosystem',
          position: 'left',
          items: [
            {label: 'Bridges', to: '/docs/bridges/overview'},
            {label: 'Bots & Integrations', to: '/docs/bots/overview'},
            {label: 'SDKs & Libraries', to: '/docs/sdks/overview'},
            {type: 'html', value: '<hr style="margin: 0.5rem 0;">'},
            {label: 'Hidden Gems', to: '/docs/gems/overview'},
          ],
        },
        {
          type: 'dropdown',
          label: 'Resources',
          position: 'left',
          items: [
            {label: 'Specification', to: '/docs/specification/overview'},
            {label: 'Deployment', to: '/docs/deployment/overview'},
            {type: 'html', value: '<hr style="margin: 0.5rem 0;">'},
            {label: 'Security & Privacy', to: '/docs/security/overview'},
            {label: 'Troubleshooting', to: '/docs/troubleshooting/overview'},
            {label: 'Community', to: '/docs/community/overview'},
          ],
        },
        {
          href: 'https://github.com/matrixdocs/matrixdocs.github.io',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },

    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            {label: 'Getting Started', to: '/docs/getting-started/introduction'},
            {label: 'Core Concepts', to: '/docs/getting-started/concepts'},
            {label: 'Hidden Gems', to: '/docs/gems/overview'},
          ],
        },
        {
          title: 'Ecosystem',
          items: [
            {label: 'Clients', to: '/docs/clients/overview'},
            {label: 'Servers', to: '/docs/servers/overview'},
            {label: 'Bridges', to: '/docs/bridges/overview'},
            {label: 'Bots', to: '/docs/bots/overview'},
          ],
        },
        {
          title: 'Resources',
          items: [
            {label: 'Deployment', to: '/docs/deployment/overview'},
            {label: 'Security', to: '/docs/security/overview'},
            {label: 'Troubleshooting', to: '/docs/troubleshooting/overview'},
            {label: 'Specification', to: '/docs/specification/overview'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'Community & Resources', to: '/docs/community/overview'},
            {label: 'Matrix.org', href: 'https://matrix.org'},
            {label: 'Element', href: 'https://element.io'},
            {label: 'GitHub', href: 'https://github.com/matrixdocs/matrixdocs.github.io'},
          ],
        },
      ],
      copyright: `Unofficial and independent: not affiliated with or endorsed by the Matrix.org Foundation or Element. Matrix is a trademark of The Matrix.org Foundation C.I.C. Built with Docusaurus.`,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'python', 'rust', 'go', 'yaml', 'toml'],
    },

    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
