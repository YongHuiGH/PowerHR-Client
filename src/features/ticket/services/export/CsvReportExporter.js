import { ReportExporter } from './ReportExporter';

export class CsvReportExporter extends ReportExporter {
    /**
     * @override
     * @param {Object} reportData
     */
    export(reportData) {
        if (!reportData || !reportData.tickets) return;

        const headers = ['Ticket ID', 'Title', 'Category', 'Priority', 'Status', 'Submitted By', 'Email', 'Created Date', 'Updated Date'];
        const csvContent = [
            headers.join(','),
            ...reportData.tickets.map(ticket => [
                ticket.ticketId,
                ticket.title ? `"${ticket.title.replace(/"/g, '""')}"` : '',
                ticket.category,
                ticket.priority,
                ticket.status,
                ticket.submittedBy ? `"${ticket.submittedBy}"` : '',
                ticket.submittedByEmail,
                new Date(ticket.createdAt).toLocaleString(),
                new Date(ticket.updatedAt).toLocaleString(),
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
