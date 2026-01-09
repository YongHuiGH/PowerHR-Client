import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Container,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
    Alert,
    Grid,
    TextField,
    MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGetUserTicketsQuery } from '@features/ticket/ticketApiSlice';
import { useSelector } from 'react-redux';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import PATHS from '@constants/routes/paths';
import { useState, useMemo } from 'react';

const statusOptions = ['All', 'Pending', 'In Progress', 'Resolved', 'Closed'];
const categoryOptions = ['All', 'Technical Issue', 'Account', 'Payroll', 'Leave Request', 'Benefits', 'Other'];

const getStatusColor = (status) => {
    switch (status) {
        case 'Pending':
            return 'warning';
        case 'In Progress':
            return 'info';
        case 'Resolved':
            return 'success';
        case 'Closed':
            return 'default';
        default:
            return 'default';
    }
};

const MyTickets = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { data, error, isLoading } = useGetUserTicketsQuery(user?.id, {
        skip: !user?.id,
    });

    const [filters, setFilters] = useState({
        status: 'All',
        category: 'All',
        startDate: '',
        endDate: '',
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const tickets = data?.tickets || [];

    const filteredTickets = useMemo(() => {
        return tickets.filter((ticket) => {
            // Filter by Status
            if (filters.status !== 'All' && ticket.status !== filters.status) {
                return false;
            }

            // Filter by Category
            if (filters.category !== 'All' && ticket.category !== filters.category) {
                return false;
            }

            // Filter by Date Range
            if (filters.startDate && filters.endDate) {
                const ticketDate = parseISO(ticket.createdAt);
                const start = startOfDay(parseISO(filters.startDate));
                const end = endOfDay(parseISO(filters.endDate));

                if (!isWithinInterval(ticketDate, { start, end })) {
                    return false;
                }
            } else if (filters.startDate) {
                 const ticketDate = parseISO(ticket.createdAt);
                 const start = startOfDay(parseISO(filters.startDate));
                 if (ticketDate < start) return false;
            } else if (filters.endDate) {
                 const ticketDate = parseISO(ticket.createdAt);
                 const end = endOfDay(parseISO(filters.endDate));
                 if (ticketDate > end) return false;
            }

            return true;
        });
    }, [tickets, filters]);

    console.log('My Tickets Data:', { tickets, totalTickets: tickets.length });

    if (isLoading) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ py: 4 }}>
                    <Alert severity="error">Failed to load tickets</Alert>
                </Box>
            </Container>
        );
    }



    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h4">My Tickets</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/applicant/tickets/submit')}
                    >
                        Submit New Ticket
                    </Button>
                </Stack>

                {/* Filter Section */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Status"
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    size="small"
                                >
                                    {statusOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Category"
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    size="small"
                                >
                                    {categoryOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="Start Date"
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="End Date"
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader title="All Tickets" subheader={`Total: ${filteredTickets.length}`} />
                    <CardContent>
                        {filteredTickets.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="text.secondary" gutterBottom>
                                    No tickets found matching your criteria
                                </Typography>
                                <Button
                                    variant="text"
                                    onClick={() => setFilters({ status: 'All', category: 'All', startDate: '', endDate: '' })}
                                    sx={{ mt: 1 }}
                                >
                                    Clear Filters
                                </Button>
                            </Box>
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Ticket ID</TableCell>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Priority</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Created</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredTickets.map((ticket) => (
                                        <TableRow key={ticket.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {ticket.ticketId}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{ticket.title}</TableCell>
                                            <TableCell>{ticket.category}</TableCell>
                                            <TableCell>
                                                <Chip label={ticket.priority} size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={ticket.status}
                                                    size="small"
                                                    color={getStatusColor(ticket.status)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption">
                                                    {format(new Date(ticket.createdAt), 'PPp')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    onClick={() => {
                                                        console.log('View button clicked!');
                                                        console.log('Ticket object:', ticket);
                                                        console.log('Ticket ID:', ticket.id);
                                                        const url = PATHS.TICKET.VIEW.URL(ticket.id);
                                                        console.log('Navigating to URL:', url);
                                                        navigate(url);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default MyTickets;
