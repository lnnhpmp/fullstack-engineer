export abstract class EventSourced<Event> {
  uncommittedEvents: Event[] = []

  abstract apply(event: Event): void

  protected record(event: Event): void {
    this.apply(event)
    this.uncommittedEvents.push(event)
  }
}
