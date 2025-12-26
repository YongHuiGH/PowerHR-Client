import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  useGetTicketByIdQuery, 
  useUpdateTicketMutation 
} from '../../features/ticket/ticketApiSlice';

const validationSchema = Yup.object({
  title: Yup.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .required('Description is required'),
  status: Yup.string()
    .oneOf(['Pending', 'In Progress', 'Resolved', 'Closed'], 'Invalid status')
    .required('Status is required'),
  priority: Yup.string()
    .oneOf(['Low', 'Medium', 'High', 'Critical'], 'Invalid priority')
    .required('Priority is required'),
  category: Yup.string()
    .required('Category is required'),
});

const statusOptions = ['Pending', 'In Progress', 'Resolved', 'Closed'];
const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
const categoryOptions = [
  'Technical Issue',
  'Account',
  'Payroll',
  'Leave Request',
  'Benefits',
  'Other'
];

const UpdateTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: ticketData, isLoading: isLoadingTicket, error: fetchError } = useGetTicketByIdQuery(id);
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      status: 'Pending',
      priority: 'Medium',
      category: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setErrorMessage('');
        setSuccessMessage('');

        const result = await updateTicket({ id, ...values }).unwrap();
        
        setSuccessMessage(result.message || 'Ticket updated successfully!');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate(`/tickets/${id}`);
        }, 2000);
      } catch (error) {
        console.error('Failed to update ticket:', error);
        setErrorMessage(error?.data?.error || 'Failed to update ticket. Please try again.');
      }
    },
  });

  // Populate form when ticket data is loaded
  useEffect(() => {
    if (ticketData?.ticket) {
      const ticket = ticketData.ticket;
      formik.setValues({
        title: ticket.title || '',
        description: ticket.description || '',
        status: ticket.status || 'Pending',
        priority: ticket.priority || 'Medium',
        category: ticket.category || '',
      });
    }
  }, [ticketData]);

  if (isLoadingTicket) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load ticket. {fetchError?.data?.error || 'Please try again.'}
        </Alert>
      </Container>
    );
  }

  const ticket = ticketData?.ticket;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Update Ticket
              </Typography>
              {ticket && (
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Chip 
                    label={ticket.ticketId} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Typography variant="caption" color="text.secondary">
                    Submitted by: {ticket.submittedByName} ({ticket.submittedByEmail})
                  </Typography>
                </Box>
              )}
            </Box>

            {successMessage && (
              <Alert severity="success" onClose={() => setSuccessMessage('')}>
                {successMessage}
              </Alert>
            )}

            {errorMessage && (
              <Alert severity="error" onClose={() => setErrorMessage('')}>
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />

                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={6}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />

                <FormControl 
                  fullWidth
                  error={formik.touched.status && Boolean(formik.errors.status)}
                >
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Status"
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.status && formik.errors.status && (
                    <FormHelperText>{formik.errors.status}</FormHelperText>
                  )}
                </FormControl>

                <FormControl 
                  fullWidth
                  error={formik.touched.priority && Boolean(formik.errors.priority)}
                >
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={formik.values.priority}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Priority"
                  >
                    {priorityOptions.map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {priority}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.priority && formik.errors.priority && (
                    <FormHelperText>{formik.errors.priority}</FormHelperText>
                  )}
                </FormControl>

                <FormControl 
                  fullWidth
                  error={formik.touched.category && Boolean(formik.errors.category)}
                >
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Category"
                  >
                    {categoryOptions.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.category && formik.errors.category && (
                    <FormHelperText>{formik.errors.category}</FormHelperText>
                  )}
                </FormControl>

                {ticket?.attachments && ticket.attachments.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Existing Attachments:
                    </Typography>
                    <Stack spacing={1}>
                      {ticket.attachments.map((file, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Typography variant="body2">
                            {file.originalName} ({(file.size / 1024).toFixed(2)} KB)
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}

                <Stack direction="row" spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isUpdating}
                    fullWidth
                  >
                    {isUpdating ? <CircularProgress size={24} /> : 'Update Ticket'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate(-1)}
                    disabled={isUpdating}
                    fullWidth
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default UpdateTicket;
