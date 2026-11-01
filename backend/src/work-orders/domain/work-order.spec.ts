import { QuoteStatus } from '../../quotes/domain/quote'
import { ExternalPartNotIdentifiedError } from './errors'
import { UrgencyLevel, WorkOrder, WorkOrderState, WorkOrderType } from './work-order'
import { WorkOrderItemType } from './work-order-item'

const newWorkOrder = () =>
  WorkOrder.create(
    {
      workOrderNumber: 'R26-00001',
      deviceId: '5001',
      type: WorkOrderType.REPAIR,
      urgencyLevel: UrgencyLevel.URGENT,
      description: 'Door rollers worn',
      isChargeable: true,
      createdAt: new Date(),
    },
    [{ type: WorkOrderItemType.MAN_HOUR, quantity: 2 }],
  )

describe('WorkOrder', () => {
  it('moves from estimate to quote as items get priced and quoted', () => {
    const workOrder = newWorkOrder()
    expect(workOrder.state()).toBe(WorkOrderState.PART_TO_ESTIMATE)

    workOrder.updateItem(workOrder.items[0].id, { price: 55 })
    expect(workOrder.state()).toBe(WorkOrderState.QUOTE_TO_SEND)

    workOrder.attachQuote('0Q0X', QuoteStatus.TO_SIGN)
    expect(workOrder.state()).toBe(WorkOrderState.QUOTE_TO_SIGN_BY_CUSTOMER)
  })

  it('does not wait for a cost on tech support items', () => {
    const workOrder = newWorkOrder()
    workOrder.addItem({ type: WorkOrderItemType.TECH_SUPPORT, comment: 'Remote diagnosis' })
    workOrder.updateItem(workOrder.items[0].id, { price: 55 })
    expect(workOrder.state()).toBe(WorkOrderState.QUOTE_TO_SEND)
  })

  it('holds the quote back until every external part has a catalogue part', () => {
    const workOrder = newWorkOrder()
    const item = workOrder.addItem({ type: WorkOrderItemType.EXTERNAL_PART, description: 'Door operator board', quantity: 1, price: 480 })
    expect(() => workOrder.assertExternalPartsIdentified()).toThrow(ExternalPartNotIdentifiedError)

    workOrder.assignCataloguePart(item.id, 'part-1')
    expect(() => workOrder.assertExternalPartsIdentified()).not.toThrow()
    expect(WorkOrder.rehydrate(workOrder.uncommittedEvents).toProps()).toEqual(workOrder.toProps())
  })

  it('tracks price-list provenance and clears it when the sell price is edited by hand', () => {
    const workOrder = newWorkOrder()
    const item = workOrder.items[0]

    workOrder.pickPriceListLine(item.id, { priceListLineId: 'line-1', timeBandId: 'band-1', sellPrice: 103.72 })
    expect(item.sellPrice).toBe(103.72)
    expect(item.priceListLineId).toBe('line-1')
    expect(item.timeBandId).toBe('band-1')
    expect(item.source).toBe('list')

    workOrder.updateItem(item.id, { sellPrice: 120 })
    expect(item.source).toBeUndefined()
    expect(item.priceListLineId).toBeUndefined()
    expect(item.timeBandId).toBeUndefined()
  })

  it('can be rebuilt from its events', () => {
    const workOrder = newWorkOrder()
    workOrder.updateItem(workOrder.items[0].id, { quantity: 3 })

    const rebuilt = WorkOrder.rehydrate(workOrder.uncommittedEvents)

    expect(rebuilt.toProps()).toEqual(workOrder.toProps())
    expect(rebuilt.version).toBe(2)
  })
})
