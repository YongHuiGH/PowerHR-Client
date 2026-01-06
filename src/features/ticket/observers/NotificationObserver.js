import { TicketObserver } from './TicketObserver';

export class NotificationObserver extends TicketObserver {
    update(eventType, ticket) {
        const message = `Notification: Ticket [${ticket.ticketId}] - ${ticket.title} was ${eventType}.`;
        console.log("sending notification to user: " + message);
        // In a real application, this would trigger a toast notification or send an email.
        // For example: toast.success(message) or emailService.send(...)
        
        if (eventType === 'closed') {
             console.log(`Email sent to ${ticket.submittedByEmail}: Your ticket has been closed.`);
        }
    }
}
