import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/introduction',
        'getting-started/concepts',
        'getting-started/quick-start',
        'getting-started/your-first-room',
      ],
    },
    {
      type: 'category',
      label: 'Clients',
      collapsed: true,
      items: [
        'clients/overview',
        'clients/element',
        'clients/alternatives',
        'clients/comparison',
      ],
    },
    {
      type: 'category',
      label: 'Servers',
      collapsed: true,
      items: [
        'servers/overview',
        'servers/synapse',
        'servers/dendrite',
        'servers/conduit',
        'servers/comparison',
      ],
    },
    {
      type: 'category',
      label: 'Bridges',
      collapsed: true,
      items: [
        'bridges/overview',
        'bridges/discord',
        'bridges/telegram',
        'bridges/slack',
        'bridges/irc',
        'bridges/signal',
        'bridges/whatsapp',
      ],
    },
    {
      type: 'category',
      label: 'Bots & Integrations',
      collapsed: true,
      items: [
        'bots/overview',
        'bots/maubot',
        'bots/mjolnir',
        'bots/hookshot',
        'bots/building-bots',
      ],
    },
    {
      type: 'category',
      label: 'SDKs & Libraries',
      collapsed: true,
      items: [
        'sdks/overview',
        'sdks/matrix-js-sdk',
        'sdks/matrix-rust-sdk',
        'sdks/matrix-python-sdk',
      ],
    },
    {
      type: 'category',
      label: 'Specification',
      collapsed: true,
      items: [
        'specification/overview',
        'specification/client-server',
        'specification/server-server',
        'specification/events',
        'specification/rooms',
      ],
    },
    {
      type: 'category',
      label: 'Hidden Gems',
      collapsed: true,
      items: [
        'gems/overview',
        'gems/power-user-tips',
        'gems/lesser-known-clients',
        'gems/advanced-features',
        'gems/self-hosting-tips',
      ],
    },
  ],
};

export default sidebars;
