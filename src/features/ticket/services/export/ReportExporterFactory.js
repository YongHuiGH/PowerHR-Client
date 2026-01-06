import { PdfReportExporter } from './PdfReportExporter';
import { ExcelReportExporter } from './ExcelReportExporter';
import { CsvReportExporter } from './CsvReportExporter';

export const ExportFormat = {
    PDF: 'PDF',
    EXCEL: 'EXCEL',
    CSV: 'CSV'
};

export class ReportExporterFactory {
    /**
     * Creates a report exporter instance based on the format.
     * @param {string} format - The export format.
     * @returns {import('./ReportExporter').ReportExporter} The report exporter instance.
     * @throws {Error} If the format is unsupported.
     */
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
