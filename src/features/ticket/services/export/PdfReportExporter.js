import { ReportExporter } from './ReportExporter';

export class PdfReportExporter extends ReportExporter {
    /**
     * @override
     * @param {Object} reportData
     */
    export(reportData) {
        console.log("Exporting report to PDF:", reportData);
        window.print();
    }
}
