import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Container,
    Divider,
    Grid,
    Stack,
    Typography,
    CircularProgress,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
} from '@mui/material';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
// import { useGetTicketByIdQuery, useCloseTicketMutation } from '@features/ticket/ticketApiSlice';
import { ticketFacade } from '@features/ticket/services/TicketFacade';
import { format } from 'date-fns';
import { useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

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

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'Low':
            return 'success';
        case 'Medium':
            return 'info';
        case 'High':
            return 'warning';
        case 'Urgent':
            return 'error';
        default:
            return 'default';
    }
};

const ViewTicketStatus = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Facade migration: local state instead of RTK hooks
    const [ticketData, setTicketData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isClosing, setIsClosing] = useState(false);

    const [openCloseDialog, setOpenCloseDialog] = useState(false);
    const [closeError, setCloseError] = useState('');
    
    // Get current user's role
    const user = useSelector((state) => state.auth.user);
    const isAdminOrEmployee = user && (user.role === 'admin' || user.role === 'employee' || user.role === 'hr');

    const fetchTicket = async () => {
        try {
            setIsLoading(true);
            const data = await ticketFacade.getTicketStatus(id);
            setTicketData(data);
            setIsLoading(false);
        } catch (err) {
            setError(err);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [id]);

    if (isLoading) {
        return (
            <Container maxWidth="md">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md">
                <Box sx={{ py: 4 }}>
                    <Alert severity="error">
                        {error.data?.error || 'Failed to load ticket details'}
                    </Alert>
                </Box>
            </Container>
        );
    }

    const ticket = ticketData?.ticket;

    if (!ticket) {
        return (
            <Container maxWidth="md">
                <Box sx={{ py: 4 }}>
                    <Alert severity="warning">Ticket not found</Alert>
                </Box>
            </Container>
        );
    }

    const handleCloseTicket = async () => {
        try {
            setCloseError('');
            setIsClosing(true);
            await ticketFacade.closeTicket(id);
            setOpenCloseDialog(false);
            // Refresh ticket data
            await fetchTicket();
            setIsClosing(false);
        } catch (err) {
            setIsClosing(false);
            console.error('Failed to close ticket:', err);
            setCloseError(err?.data?.error || 'Failed to close ticket. Please try again.');
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 2 }}
                >
                    Back
                </Button>

                {closeError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCloseError('')}>
                        {closeError}
                    </Alert>
                )}

                <Card elevation={3}>
                    <CardHeader
                        title={`Ticket Details - ${ticket.ticketId}`}
                        subheader={`Submitted on ${format(new Date(ticket.createdAt), 'PPpp')}`}
                        action={
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                    label={ticket.status}
                                    color={getStatusColor(ticket.status)}
                                    sx={{ fontWeight: 'bold' }}
                                />
                                {isAdminOrEmployee && ticket.status !== 'Closed' && (
                                    <>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => navigate(`/tickets/${id}/update`)}
                                        >
                                            Update
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="error"
                                            startIcon={<CloseIcon />}
                                            onClick={() => setOpenCloseDialog(true)}
                                        >
                                            Close
                                        </Button>
                                    </>
                                )}
                            </Stack>
                        }
                    />
                    <Divider />
                    <CardContent>
                        <Stack spacing={3}>
                            {/* Title */}
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Title
                                </Typography>
                                <Typography variant="h6">{ticket.title}</Typography>
                            </Box>

                            {/* Description */}
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Description
                                </Typography>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {ticket.description}
                                </Typography>
                            </Box>

                            <Divider />

                            {/* Additional Details */}
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Category
                                    </Typography>
                                    <Chip label={ticket.category} variant="outlined" />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Priority
                                    </Typography>
                                    <Chip
                                        label={ticket.priority}
                                        color={getPriorityColor(ticket.priority)}
                                        variant="outlined"
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Submitted By
                                    </Typography>
                                    <Typography variant="body2">
                                        {ticket.submittedByName || ticket.submittedBy?.firstName + ' ' + ticket.submittedBy?.lastName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {ticket.submittedByEmail || ticket.submittedBy?.email}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Last Updated
                                    </Typography>
                                    <Typography variant="body2">
                                        {format(new Date(ticket.updatedAt), 'PPpp')}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {/* Attachments */}
                            {ticket.attachments && ticket.attachments.length > 0 && (
                                <>
                                    <Divider />
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Attachments ({ticket.attachments.length})
                                        </Typography>
                                        <Grid container spacing={2} sx={{ mt: 1 }}>
                                            {ticket.attachments.map((file, index) => (
                                                <Grid item xs={12} sm={6} md={4} key={index}>
                                                    <Card variant="outlined">
                                                        <Box
                                                            component="img"
                                                            src={`http://localhost:3000${file.path}`}
                                                            alt={file.originalName}
                                                            sx={{
                                                                width: '100%',
                                                                height: 200,
                                                                objectFit: 'cover',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => window.open(`http://localhost:3000${file.path}`, '_blank')}
                                                        />
                                                        <Box sx={{ p: 1 }}>
                                                            <Typography variant="caption" noWrap>
                                                                {file.originalName}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                {(file.size / 1024).toFixed(2)} KB
                                                            </Typography>
                                                        </Box>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                </>
                            )}

                            {/* Status Information */}
                            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Current Status
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                        label={ticket.status}
                                        color={getStatusColor(ticket.status)}
                                        size="small"
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        {ticket.status === 'Pending' && 'Your ticket is awaiting review'}
                                        {ticket.status === 'In Progress' && 'Your ticket is being processed'}
                                        {ticket.status === 'Resolved' && 'Your ticket has been resolved'}
                                        {ticket.status === 'Closed' && 'This ticket has been closed'}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Close Ticket Confirmation Dialog */}
                <Dialog
                    open={openCloseDialog}
                    onClose={() => setOpenCloseDialog(false)}
                >
                    <DialogTitle>Close Ticket</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to close this ticket? This action will update the ticket status to "Closed".
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={() => setOpenCloseDialog(false)}
                            disabled={isClosing}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCloseTicket}
                            color="error"
                            variant="contained"
                            disabled={isClosing}
                        >
                            {isClosing ? <CircularProgress size={20} /> : 'Close Ticket'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
};

export default ViewTicketStatus;
