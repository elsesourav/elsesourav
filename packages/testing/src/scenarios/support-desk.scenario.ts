import type { SupportTicket, SupportTicketListItem } from '@elsesourav/types';
import {
  fixtureSupportTicketsList,
  fixtureSupportTicketListItems,
  fixtureTicketOpen,
} from '../fixtures/support.fixtures';
import { createSupportTicketListItem } from '../factories/support.factory';

export interface SupportDeskScenarioData {
  readonly tickets: readonly SupportTicket[];
  readonly listItems: readonly SupportTicketListItem[];
}

export function createEmptySupportScenario(): SupportDeskScenarioData {
  return {
    tickets: [],
    listItems: [],
  };
}

export function createSingleTicketSupportScenario(): SupportDeskScenarioData {
  return {
    tickets: [fixtureTicketOpen],
    listItems: [createSupportTicketListItem(fixtureTicketOpen)],
  };
}

export function createPopulatedSupportScenario(): SupportDeskScenarioData {
  return {
    tickets: fixtureSupportTicketsList,
    listItems: fixtureSupportTicketListItems,
  };
}
