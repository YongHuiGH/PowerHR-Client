/**
 * Observer interface for listening to ticket events.
 */
export class TicketObserver {
    /**
     * Called when a ticket event occurs.
     * @param {string} eventType - The type of event (e.g., 'created', 'updated', 'closed').
     * @param {Object} ticket - The ticket data associated with the event.
     */
    update(eventType, ticket) {
        throw new Error("Method 'update()' must be implemented.");
    }
}
