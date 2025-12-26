import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from '@mui/material';
import { Download, FileDownload } from '@mui/icons-material';
import { useGenerateTicketReportMutation } from '../../features/ticket/ticketApiSlice';

const statusColors = {
  'Pending': 'warning',
  'In Progress': 'info',
  'Resolved': 'success',
  'Closed': 'default',
};

const priorityColors = {
  'Low': 'info',
  'Medium': 'warning',
  'High': 'error',
  'Critical': 'error',
};

const TicketReport = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: 'All',
    status: 'All',
    priority: 'All',
  });

  const [reportType, setReportType] = useState('summary'); // 'summary' or 'detailed'

  const [reportData, setReportData] = useState(null);
  const [generateReport, { isLoading, error }] = useGenerateTicketReportMutation();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleGenerateReport = async () => {
    try {
      const result = await generateReport(filters).unwrap();
      setReportData(result.reportData);
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  };

  const handleExportCSV = () => {
    if (!reportData || !reportData.tickets) return;

    const headers = ['Ticket ID', 'Title', 'Category', 'Priority', 'Status', 'Submitted By', 'Email', 'Created Date', 'Updated Date'];
    const csvContent = [
      headers.join(','),
      ...reportData.tickets.map(ticket => [
        ticket.ticketId,
        `"${ticket.title.replace(/"/g, '""')}"`,
        ticket.category,
        ticket.priority,
        ticket.status,
        `"${ticket.submittedBy}"`,
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
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleExportExcel = () => {
    if (!reportData || !reportData.tickets) return;

    // Create Excel-compatible CSV with UTF-8 BOM
    const headers = ['Ticket ID', 'Title', 'Category', 'Priority', 'Status', 'Submitted By', 'Email', 'Created Date', 'Updated Date'];
    const csvContent = [
      headers.join('\t'),
      ...reportData.tickets.map(ticket => [
        ticket.ticketId,
        ticket.title.replace(/"/g, '""'),
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
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleExportPDF = () => {
    window.print();
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleExport = () => {
    // Step 3: Employee selects a file format
    switch (selectedFormat) {
      case 'csv':
        handleExportCSV();
        break;
      case 'excel':
        handleExportExcel();
        break;
      case 'pdf':
        handleExportPDF();
        break;
      default:
        break;
    }
    setExportDialogOpen(false);
  };

  const handleOpenExportDialog = () => {
    // Step 2: System prompts for export format
    setExportDialogOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h4">
              Generate Ticket Report
            </Typography>

            {/* Filters Section */}
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom>
                Report Filters
              </Typography>
              
              {/* Report Type Selection */}
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Report Type</InputLabel>
                    <Select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      label="Report Type"
                    >
                      <MenuItem value="summary">High-Level Summary (Counts & Charts)</MenuItem>
                      <MenuItem value="detailed">Detailed Report (Full Ticket List)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={filters.startDate}
                    onChange={handleFilterChange('startDate')}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={filters.endDate}
                    onChange={handleFilterChange('endDate')}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filters.category}
                      onChange={handleFilterChange('category')}
                      label="Category"
                    >
                      <MenuItem value="All">All Categories</MenuItem>
                      <MenuItem value="Technical Issue">Technical Issue</MenuItem>
                      <MenuItem value="Account">Account</MenuItem>
                      <MenuItem value="Payroll">Payroll</MenuItem>
                      <MenuItem value="Leave Request">Leave Request</MenuItem>
                      <MenuItem value="Benefits">Benefits</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={handleFilterChange('status')}
                      label="Status"
                    >
                      <MenuItem value="All">All Status</MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Resolved">Resolved</MenuItem>
                      <MenuItem value="Closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={filters.priority}
                      onChange={handleFilterChange('priority')}
                      label="Priority"
                    >
                      <MenuItem value="All">All Priorities</MenuItem>
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Critical">Critical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGenerateReport}
                    disabled={isLoading}
                    fullWidth
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Generate Report'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {error && (
              <Alert severity="error">
                Failed to generate report. {error?.data?.error || 'Please try again.'}
              </Alert>
            )}

            {/* Report Results */}
            {reportData && (
              <>
                {/* Statistics Cards */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: 'primary.lighter' }}>
                      <CardContent>
                        <Typography variant="h4" color="primary.main">
                          {reportData.statistics.totalTickets}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Tickets
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: 'warning.lighter' }}>
                      <CardContent>
                        <Typography variant="h4" color="warning.main">
                          {reportData.statistics.byStatus['Pending'] || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pending
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: 'info.lighter' }}>
                      <CardContent>
                        <Typography variant="h4" color="info.main">
                          {reportData.statistics.byStatus['In Progress'] || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          In Progress
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: 'success.lighter' }}>
                      <CardContent>
                        <Typography variant="h4" color="success.main">
                          {(reportData.statistics.byStatus['Resolved'] || 0) + (reportData.statistics.byStatus['Closed'] || 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Resolved/Closed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Average Resolution Time */}
                {reportData.statistics.averageResolutionTime > 0 && (
                  <Alert severity="info">
                    Average Resolution Time: <strong>{reportData.statistics.averageResolutionTime} hours</strong>
                  </Alert>
                )}

                <Divider />

                {/* Report Type: Summary View */}
                {reportType === 'summary' && (
                  <>
                    {/* Summary Charts and Counts */}
                    <Typography variant="h5" gutterBottom>
                      Summary Report
                    </Typography>

                    {/* By Status Breakdown */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Status Distribution
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(reportData.statistics.byStatus).map(([status, count]) => (
                          <Grid item xs={6} sm={3} key={status}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                              <Typography variant="h3" color={statusColors[status] + '.main'}>
                                {count}
                              </Typography>
                              <Chip label={status} size="small" color={statusColors[status]} sx={{ mt: 1 }} />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>

                    {/* By Priority Breakdown */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Priority Distribution
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(reportData.statistics.byPriority).map(([priority, count]) => (
                          <Grid item xs={6} sm={3} key={priority}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                              <Typography variant="h3" color={priorityColors[priority] + '.main'}>
                                {count}
                              </Typography>
                              <Chip label={priority} size="small" color={priorityColors[priority]} sx={{ mt: 1 }} />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>

                    {/* By Category Breakdown */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Category Distribution
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Category</strong></TableCell>
                              <TableCell align="right"><strong>Count</strong></TableCell>
                              <TableCell align="right"><strong>Percentage</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(reportData.statistics.byCategory)
                              .sort((a, b) => b[1] - a[1])
                              .map(([category, count]) => (
                                <TableRow key={category}>
                                  <TableCell>{category}</TableCell>
                                  <TableCell align="right">
                                    <Chip label={count} size="small" color="primary" variant="outlined" />
                                  </TableCell>
                                  <TableCell align="right">
                                    {((count / reportData.statistics.totalTickets) * 100).toFixed(1)}%
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </>
                )}

                {/* Report Type: Detailed View */}
                {reportType === 'detailed' && (
                  <>
                    <Typography variant="h5" gutterBottom>
                      Detailed Ticket Report
                    </Typography>

                    <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ticket ID</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Submitted By</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Updated</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.tickets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            <Typography variant="body2" color="text.secondary">
                              No tickets found matching the selected filters.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        reportData.tickets.map((ticket) => (
                          <TableRow key={ticket.id} hover>
                            <TableCell>
                              <Chip label={ticket.ticketId} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                                {ticket.title}
                              </Typography>
                            </TableCell>
                            <TableCell>{ticket.category}</TableCell>
                            <TableCell>
                              <Chip
                                label={ticket.priority}
                                size="small"
                                color={priorityColors[ticket.priority]}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={ticket.status}
                                size="small"
                                color={statusColors[ticket.status]}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{ticket.submittedBy}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {ticket.submittedByEmail}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">{formatDate(ticket.createdAt)}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">{formatDate(ticket.updatedAt)}</Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                  </>
                )}

                {/* Export Controls - Available for both report types */}
                <Divider sx={{ mt: 3, mb: 3 }} />

                {exportSuccess && (
                  <Alert severity="success" onClose={() => setExportSuccess(false)} sx={{ mb: 2 }}>
                    Report exported successfully! Your file is ready to download or save.
                  </Alert>
                )}

                {/* Export Button */}
                <Stack direction="row" spacing={2} justifyContent="flex-end" className="no-print">
                  <Button
                    variant="contained"
                    startIcon={<FileDownload />}
                    onClick={handleOpenExportDialog}
                    size="large"
                  >
                    Export Ticket Report
                  </Button>
                </Stack>

                {/* Export Format Selection Dialog */}
                <Dialog 
                  open={exportDialogOpen} 
                  onClose={() => setExportDialogOpen(false)} 
                  maxWidth="sm" 
                  fullWidth
                  className="no-print"
                >
                  <DialogTitle>Export Ticket Report</DialogTitle>
                  <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Please select the file format for your report export.
                      </Typography>
                      
                      <FormControl component="fieldset">
                        <FormLabel component="legend">Export Format</FormLabel>
                        <RadioGroup
                          value={selectedFormat}
                          onChange={(e) => setSelectedFormat(e.target.value)}
                        >
                          <FormControlLabel 
                            value="pdf" 
                            control={<Radio />} 
                            label="PDF (Portable Document Format)" 
                          />
                          <FormControlLabel 
                            value="csv" 
                            control={<Radio />} 
                            label="CSV (Comma-Separated Values)" 
                          />
                          <FormControlLabel 
                            value="excel" 
                            control={<Radio />} 
                            label="Excel (Microsoft Excel Format)" 
                          />
                        </RadioGroup>
                      </FormControl>

                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="caption">
                          <strong>PDF:</strong> Best for printing and sharing<br />
                          <strong>CSV:</strong> Compatible with most spreadsheet applications<br />
                          <strong>Excel:</strong> Optimized for Microsoft Excel
                        </Typography>
                      </Alert>
                    </Stack>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setExportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={handleExport}
                      startIcon={<Download />}
                    >
                      Export
                    </Button>
                  </DialogActions>
                </Dialog>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Report generated on {new Date(reportData.generatedAt).toLocaleString()}
                  </Typography>
                </Box>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          /* Ensure statistics cards and table are visible */
          body * {
            visibility: hidden;
          }
          
          /* Make report content visible */
          .MuiContainer-root,
          .MuiContainer-root * {
            visibility: visible;
          }
          
          /* Position report content at top of page */
          .MuiContainer-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
          /* Improve print layout */
          .MuiCard-root {
            box-shadow: none !important;
            border: 1px solid #ddd;
          }
          
          /* Better spacing for statistics cards */
          .MuiGrid-item {
            break-inside: avoid;
          }
          
          /* Ensure table fits on page */
          table {
            width: 100%;
            border-collapse: collapse;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            font-size: 10pt;
          }
          
          /* Page title */
          h4 {
            font-size: 18pt;
            margin-bottom: 20px;
            color: #000;
          }
        }
      `}</style>
    </Container>
  );
};

export default TicketReport;
