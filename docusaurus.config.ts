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

    metadata: [
      {name: 'keywords', content: 'matrix, protocol, decentralized, chat, element, synapse, federation, bridges, bots'},
      {name: 'description', content: 'The definitive Matrix protocol developer resource - comprehensive guides, hidden gems, and power user tips'},
      {property: 'og:type', content: 'website'},
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
          to: '/specification/overview',
          label: 'Spec',
          position: 'left',
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
          title: 'Community',
          items: [
            {label: 'Matrix.org', href: 'https://matrix.org'},
            {label: 'Element', href: 'https://element.io'},
            {label: 'Spec', href: 'https://spec.matrix.org'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'GitHub', href: 'https://github.com/matrixdocs/matrixdocs.github.io'},
            {label: 'Matrix Room', href: 'https://matrix.to/#/#matrixdocs:matrix.org'},
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
