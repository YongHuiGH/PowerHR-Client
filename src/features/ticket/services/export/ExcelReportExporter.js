import { ReportExporter } from './ReportExporter';

export class ExcelReportExporter extends ReportExporter {
    /**
     * @override
     * @param {Object} reportData
     */
    export(reportData) {
        if (!reportData || !reportData.tickets) return;

        // Create Excel-compatible CSV with UTF-8 BOM
        const headers = ['Ticket ID', 'Title', 'Category', 'Priority', 'Status', 'Submitted By', 'Email', 'Created Date', 'Updated Date'];
        const csvContent = [
            headers.join('\t'),
            ...reportData.tickets.map(ticket => [
                ticket.ticketId,
                ticket.title ? ticket.title.replace(/"/g, '""') : '',
                ticket.category,
                ticket.priority,
                ticket.status,
                ticket.submittedBy,
                ticket.submittedByEmail,
                new Date(ticket.createdAt).toLocaleString(),
                new Date(ticket.updatedAt).toLocaleString(),
            ].join('\t'))
        ].join('\n');

        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-report-${new Date().toISOString().split('T')[0]}.xls`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
