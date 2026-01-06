/**
 * Interface-like class for Report Exporters.
 * @interface
 */
export class ReportExporter {
    /**
     * Exports the ticket report data.
     * @param {Object} reportData - The report data to export.
     * @returns {void}
     * @throws {Error} If the method is not implemented.
     */
    export(reportData) {
        throw new Error("Method 'export()' must be implemented.");
    }
}
