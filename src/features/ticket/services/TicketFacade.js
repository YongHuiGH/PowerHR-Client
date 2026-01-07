import { store } from '../../../store';
import { ticketApiSlice } from '../ticketApiSlice';
import { ReportExporterFactory } from './export/ReportExporterFactory';
import { NotificationObserver } from '../observers/NotificationObserver';

/* TicketFacade */
class TicketFacade {
    constructor() {
        this.observers = [];
        // register default observer
        this.attach(new NotificationObserver());
    }

    /**
     * Attaches an observer to the ticket facade.
     * @param {Object} observer - The observer to attach.
     */
    attach(observer) {
        this.observers.push(observer);
    }

    /**
     * Detaches an observer from the ticket facade.
     * @param {Object} observer - The observer to detach.
     */
    detach(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    /**
     * Notifies all observers of a ticket event.
     * @param {string} eventType - The type of event.
     * @param {Object} ticket - The ticket data.
     */
    notifyObservers(eventType, ticket) {
        this.observers.forEach(observer => observer.update(eventType, ticket));
    }

    /**
     * Submits a new ticket.
     * @param {Object} ticketDTO - The ticket data transfer object.
     * @returns {Promise<Object>} The created ticket.
     */
    async submitTicket(ticketDTO) {
        try {
            const result = await store.dispatch(ticketApiSlice.endpoints.submitTicket.initiate(ticketDTO)).unwrap();
            
            // Check if result has ticket data to notify
            if (result && result.ticket) {
                this.notifyObservers('created', result.ticket);
            }
            
            return result;
        } catch (error) {
            console.error("TicketFacade: Failed to submit ticket", error);
            throw error;
        }
    }

    /**
     * Updates an existing ticket.
     * @param {string} ticketId - The ID of the ticket to update.
     * @param {Object} updateDTO - The update data.
     * @returns {Promise<Object>} The updated ticket.
     */
    async updateTicket(ticketId, updateDTO) {
        try {
            const result = await store.dispatch(ticketApiSlice.endpoints.updateTicket.initiate({ id: ticketId, ...updateDTO })).unwrap();
            
             // Check if result has ticket data or we need to fetch it
             // Assuming result structure contains the updated ticket or message
             // If the API returns the updated ticket:
             if (result && result.ticket) {
                 this.notifyObservers('updated', result.ticket);
             } else {
                 // Fallback: Notify with partial data or fetch fresh
                 this.notifyObservers('updated', { id: ticketId, ...updateDTO });
             }

            return result;
        } catch (error) {
            console.error("TicketFacade: Failed to update ticket", error);
            throw error;
        }
    }

    /**
     * Closes a ticket.
     * @param {string} ticketId - The ID of the ticket to close.
     * @returns {Promise<void>}
     */
    async closeTicket(ticketId) {
        try {
            const result = await store.dispatch(ticketApiSlice.endpoints.closeTicket.initiate(ticketId)).unwrap();
            
            // Assuming result contains the closed ticket
            if (result && result.ticket) {
                 this.notifyObservers('closed', result.ticket);
            } else {
                 this.notifyObservers('closed', { id: ticketId, status: 'Closed' });
            }

        } catch (error) {
            console.error("TicketFacade: Failed to close ticket", error);
            throw error;
        }
    }

    /**
     * Retrieves the status (and details) of a ticket.
     * @param {string} ticketId - The ID of the ticket.
     * @returns {Promise<Object>} The ticket details.
     */
    async getTicketStatus(ticketId) {
        try {
            // forceRefetch ensures we get the latest status
            const result = await store.dispatch(ticketApiSlice.endpoints.getTicketById.initiate(ticketId, { forceRefetch: true })).unwrap();
            return result;
        } catch (error) {
            console.error("TicketFacade: Failed to get ticket status", error);
            throw error;
        }
    }

    /**
     * Generates a ticket report based on criteria.
     * @param {Object} reportCriteria - The criteria for the report.
     * @returns {Promise<Object>} The generated report.
     */
    async generateReport(reportCriteria) {
        try {
            const result = await store.dispatch(ticketApiSlice.endpoints.generateTicketReport.initiate(reportCriteria)).unwrap();
            return result;
        } catch (error) {
            console.error("TicketFacade: Failed to generate report", error);
            throw error;
        }
    }

    /**
     * Exports a ticket report in the specified format.
     * @param {string} format - The export format (from ExportFormat).
     * @param {Object} ticketReport - The report data to export.
     * @returns {Object} The report (or export result).
     */
    exportReport(format, ticketReport) {
        try {
            const exporter = ReportExporterFactory.createExporter(format);
            exporter.export(ticketReport);
            return ticketReport; // Returning the report or some indicator
        } catch (error) {
            console.error("TicketFacade: Failed to export report", error);
            throw error;
        }
    }
}

export const ticketFacade = new TicketFacade();
