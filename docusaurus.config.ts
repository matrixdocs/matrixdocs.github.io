import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Matrix Docs',
  tagline: 'The definitive Matrix protocol developer resource - from beginner to power user',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://matrixdocs.github.io',
  baseUrl: '/',
  organizationName: 'matrixdocs',
  projectName: 'matrixdocs.github.io',
  trailingSlash: false,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

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
        description: 'The definitive Matrix protocol developer resource - comprehensive guides, hidden gems, and power user tips',
        publisher: {
          '@type': 'Organization',
          name: 'Matrix Docs Community',
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
          editUrl: 'https://github.com/matrixdocs/matrixdocs.github.io/tree/main/',
          routeBasePath: '/',
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
      {name: 'author', content: 'Matrix Docs Community'},
      {name: 'robots', content: 'index, follow'},
      // Open Graph
      {property: 'og:type', content: 'website'},
      {property: 'og:site_name', content: 'Matrix Docs'},
      {property: 'og:locale', content: 'en_US'},
      // Twitter Card
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:site', content: '@matrixdotorg'},
      {name: 'twitter:creator', content: '@matrixdotorg'},
    ],

    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },

    announcementBar: {
      id: 'contribute',
      content: 'Help improve these docs! <a href="https://github.com/matrixdocs/matrixdocs.github.io">Contribute on GitHub</a>',
      backgroundColor: '#0DBD8B',
      textColor: '#fff',
      isCloseable: true,
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
          to: '/getting-started/introduction',
          label: 'Getting Started',
          position: 'left',
        },
        {
          to: '/clients/overview',
          label: 'Clients',
          position: 'left',
        },
        {
          to: '/servers/overview',
          label: 'Servers',
          position: 'left',
        },
        {
          type: 'dropdown',
          label: 'Ecosystem',
          position: 'left',
          items: [
            {label: 'Bridges', to: '/bridges/overview'},
            {label: 'Bots & Integrations', to: '/bots/overview'},
            {label: 'SDKs & Libraries', to: '/sdks/overview'},
            {type: 'html', value: '<hr style="margin: 0.5rem 0;">'},
            {label: 'Hidden Gems', to: '/gems/overview'},
          ],
        },
        {
          type: 'dropdown',
          label: 'Resources',
          position: 'left',
          items: [
            {label: 'Specification', to: '/specification/overview'},
            {label: 'Deployment', to: '/deployment/overview'},
            {type: 'html', value: '<hr style="margin: 0.5rem 0;">'},
            {label: 'Security & Privacy', to: '/security/overview'},
            {label: 'Troubleshooting', to: '/troubleshooting/overview'},
            {label: 'Community', to: '/community/overview'},
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
            {label: 'Getting Started', to: '/getting-started/introduction'},
            {label: 'Core Concepts', to: '/getting-started/concepts'},
            {label: 'Hidden Gems', to: '/gems/overview'},
          ],
        },
        {
          title: 'Ecosystem',
          items: [
            {label: 'Clients', to: '/clients/overview'},
            {label: 'Servers', to: '/servers/overview'},
            {label: 'Bridges', to: '/bridges/overview'},
            {label: 'Bots', to: '/bots/overview'},
          ],
        },
        {
          title: 'Resources',
          items: [
            {label: 'Deployment', to: '/deployment/overview'},
            {label: 'Security', to: '/security/overview'},
            {label: 'Troubleshooting', to: '/troubleshooting/overview'},
            {label: 'Specification', to: '/specification/overview'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'Community & Resources', to: '/community/overview'},
            {label: 'Matrix.org', href: 'https://matrix.org'},
            {label: 'Element', href: 'https://element.io'},
            {label: 'GitHub', href: 'https://github.com/matrixdocs/matrixdocs.github.io'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Matrix Docs Community. Built with Docusaurus.`,
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
