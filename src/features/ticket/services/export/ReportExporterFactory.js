
class ReportExporter {
    export(reportData) {
        throw new Error("Method 'export()' must be implemented.");
    }
}

class PdfReportExporter extends ReportExporter {
    export(reportData) {
        console.log("Exporting report to PDF:", reportData);
        window.print();
    }
}

class ExcelReportExporter extends ReportExporter {
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

class CsvReportExporter extends ReportExporter {
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

export const ExportFormat = {
    PDF: 'PDF',
    EXCEL: 'EXCEL',
    CSV: 'CSV'
};

export class ReportExporterFactory {
    static createExporter(format) {
        switch (format) {
            case ExportFormat.PDF:
                return new PdfReportExporter();
            case ExportFormat.EXCEL:
                return new ExcelReportExporter();
            case ExportFormat.CSV:
                return new CsvReportExporter();
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
}
