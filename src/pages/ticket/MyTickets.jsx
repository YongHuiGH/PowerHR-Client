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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGetUserTicketsQuery } from '@features/ticket/ticketApiSlice';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';

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

    const tickets = data?.tickets || [];

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

                <Card>
                    <CardHeader title="All Tickets" subheader={`Total: ${tickets.length}`} />
                    <CardContent>
                        {tickets.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="text.secondary" gutterBottom>
                                    No tickets found
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/applicant/tickets/submit')}
                                    sx={{ mt: 2 }}
                                >
                                    Submit Your First Ticket
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
                                    {tickets.map((ticket) => (
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
                                                    onClick={() => navigate(`/applicant/tickets/${ticket.id}`)}
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
