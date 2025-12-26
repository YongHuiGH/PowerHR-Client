import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit, Visibility, Close } from '@mui/icons-material';
import { useGetAllTicketsQuery } from '../../features/ticket/ticketApiSlice';

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

const AllTickets = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
  });

  const { data, isLoading, error } = useGetAllTicketsQuery(filters);

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: '',
    });
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

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load tickets. {error?.data?.error || 'Please try again.'}
        </Alert>
      </Container>
    );
  }

  const tickets = data?.tickets || [];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">
                All Support Tickets
              </Typography>
              <Chip 
                label={`${tickets.length} Ticket${tickets.length !== 1 ? 's' : ''}`} 
                color="primary" 
              />
            </Box>

            {/* Filters */}
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={handleFilterChange('status')}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  onChange={handleFilterChange('priority')}
                  label="Priority"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 180 }} size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={handleFilterChange('category')}
                  label="Category"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Technical Issue">Technical Issue</MenuItem>
                  <MenuItem value="Account">Account</MenuItem>
                  <MenuItem value="Payroll">Payroll</MenuItem>
                  <MenuItem value="Leave Request">Leave Request</MenuItem>
                  <MenuItem value="Benefits">Benefits</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>

              {(filters.status || filters.priority || filters.category) && (
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </Stack>

            {/* Tickets Table */}
            {tickets.length === 0 ? (
              <Alert severity="info">
                No tickets found. {(filters.status || filters.priority || filters.category) && 'Try adjusting your filters.'}
              </Alert>
            ) : (
              <TableContainer>
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
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow 
                        key={ticket.id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>
                          <Chip 
                            label={ticket.ticketId} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                            {ticket.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {ticket.category}
                          </Typography>
                        </TableCell>
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
                          <Typography variant="body2">
                            {ticket.submittedByName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {ticket.submittedByEmail}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(ticket.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Update Ticket">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => navigate(`/tickets/${ticket.id}/update`)}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AllTickets;
