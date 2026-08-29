import type { SupportTicket, SupportTicketMessage, SupportTicketListItem } from '@elsesourav/types';
import { createSupportTicketListItem } from '../factories/support.factory';

export const fixtureTicketMessagesOpen: readonly SupportTicketMessage[] = [
  {
    id: 'tmsg-101',
    ticketId: 'tick-open-1',
    senderUserId: 'usr-standard-1',
    senderName: 'Alex Rivers',
    senderRole: 'USER',
    message:
      'I am encountering a WebSocket handshake drop when launching Terminal Pro inside Safari on macOS Sonoma 14.4.',
    attachments: [],
    isInternalNote: false,
    createdAt: 1704067200000,
  },
  {
    id: 'tmsg-102',
    ticketId: 'tick-open-1',
    senderUserId: 'usr-staff-1',
    senderName: 'Jordan Taylor',
    senderRole: 'STAFF',
    message:
      'Thanks for reporting this Alex. Safari 17.4 tightened WSS cross-origin headers. Could you test if disabling Content Blockers for terminal.elsesourav.com resolves the handshake?',
    attachments: [],
    isInternalNote: false,
    createdAt: 1704070800000,
  },
  {
    id: 'tmsg-103',
    ticketId: 'tick-open-1',
    senderUserId: 'usr-staff-1',
    senderName: 'Jordan Taylor',
    senderRole: 'STAFF',
    message:
      'Internal Note: Checked proxy logs; proxy rejected Origin due to trailing slash mismatch.',
    attachments: [],
    isInternalNote: true,
    createdAt: 1704071400000,
  },
];

export const fixtureTicketWithAttachment: SupportTicket = {
  id: 'tick-attachment-1',
  ticketNumber: 'TICK-2026-0002',
  userId: 'usr-standard-1',
  userEmail: 'developer@example.test',
  userName: 'Alex Rivers',
  subject: 'Palette Studio OKLCH Export formatting error',
  description:
    'When exporting to Tailwind V4 CSS format, hex values are generated without alpha channel.',
  category: 'Bug Report',
  priority: 'high',
  status: 'in_progress',
  messages: [
    {
      id: 'tmsg-201',
      ticketId: 'tick-attachment-1',
      senderUserId: 'usr-standard-1',
      senderName: 'Alex Rivers',
      senderRole: 'USER',
      message:
        'Here is the exported tailwind.config.js snippet showing the malformed color definitions.',
      attachments: [
        'https://res.cloudinary.com/elsesourav/image/upload/v2/debug/tailwind-export-sample.txt',
      ],
      isInternalNote: false,
      createdAt: 1704153600000,
    },
  ],
  lastMessageAt: 1704153600000,
  createdAt: 1704153600000,
  updatedAt: 1704153600000,
};

export const fixtureTicketResolved: SupportTicket = {
  id: 'tick-resolved-1',
  ticketNumber: 'TICK-2026-0003',
  userId: 'usr-standard-1',
  userEmail: 'developer@example.test',
  userName: 'Alex Rivers',
  subject: 'Feature Request: Add truecolor support to FocusFlow notifications',
  description: 'Would love to have custom RGB notification badges when timer sessions finish.',
  category: 'Feature Request',
  priority: 'low',
  status: 'resolved',
  messages: [
    {
      id: 'tmsg-301',
      ticketId: 'tick-resolved-1',
      senderUserId: 'usr-standard-1',
      senderName: 'Alex Rivers',
      senderRole: 'USER',
      message: 'Feature proposal submitted.',
      attachments: [],
      isInternalNote: false,
      createdAt: 1704240000000,
    },
    {
      id: 'tmsg-302',
      ticketId: 'tick-resolved-1',
      senderUserId: 'usr-admin-1',
      senderName: 'Sourav',
      senderRole: 'ADMIN',
      message: 'Implemented and shipped in FocusFlow v1.2.0! Closing ticket.',
      attachments: [],
      isInternalNote: false,
      createdAt: 1704247200000,
    },
  ],
  lastMessageAt: 1704247200000,
  createdAt: 1704240000000,
  updatedAt: 1704247200000,
};

export const fixtureTicketOpen: SupportTicket = {
  id: 'tick-open-1',
  ticketNumber: 'TICK-2026-0001',
  userId: 'usr-standard-1',
  userEmail: 'developer@example.test',
  userName: 'Alex Rivers',
  subject: 'Cannot connect to web terminal WebSocket',
  description:
    'Observed intermittent connection dropouts when executing long-running builds through web terminal proxy.',
  category: 'Technical Support',
  priority: 'medium',
  status: 'open',
  messages: fixtureTicketMessagesOpen,
  lastMessageAt: 1704070800000,
  createdAt: 1704067200000,
  updatedAt: 1704070800000,
};

export const fixtureSupportTicketsList: readonly SupportTicket[] = [
  fixtureTicketOpen,
  fixtureTicketWithAttachment,
  fixtureTicketResolved,
];

export const fixtureSupportTicketListItems: readonly SupportTicketListItem[] =
  fixtureSupportTicketsList.map((t) => createSupportTicketListItem(t));
