import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common'
import { upsertContractDevice } from '../../salesforce-sync/contract-device.consumer'
import { onQuoteStatusChanged } from '../../salesforce-sync/quote-status.consumer'
import type { Deps } from './deps'

type Listener = { changeTypes?: string[]; handle: (record: any, deps: Deps) => Promise<void> }

const listeners: Record<string, Listener[]> = {
  ContractDeviceAssociation__c: [{ changeTypes: ['created', 'updated', 'undeleted'], handle: upsertContractDevice }],
  QuoteStatusChangeEvent__e: [{ handle: onQuoteStatusChanged }],
}

@Controller('salesforce')
export class SalesforceEventsController {
  constructor(@Inject('DEPS') private readonly deps: Deps) {}

  @Post('events')
  @HttpCode(200)
  async receive(@Body() event: { topic: string; changeType?: string; record: object }) {
    const matching = (listeners[event.topic] ?? []).filter(
      (l) => !l.changeTypes || l.changeTypes.includes(event.changeType ?? ''),
    )
    for (const listener of matching) await listener.handle(event.record, this.deps)
    return { handled: matching.length }
  }
}
