import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
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
    Chip,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useSubmitTicketMutation } from '@features/ticket/ticketApiSlice';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import PATHS from '@constants/routes/paths';

const validationSchema = Yup.object().shape({
    title: Yup.string().max(200).required('Title is required'),
    description: Yup.string().required('Description is required'),
    category: Yup.string().required('Category is required'),
    priority: Yup.string().required('Priority is required'),
});

const SubmitTicket = () => {
    const navigate = useNavigate();
    const [submitTicket, { isLoading }] = useSubmitTicketMutation();
    const { user } = useSelector((state) => state.auth);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submittedTicket, setSubmittedTicket] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length + selectedFiles.length > 5) {
            alert('Maximum 5 files allowed');
            return;
        }
        setSelectedFiles([...selectedFiles, ...files]);
    };

    const removeFile = (index) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            category: '',
            priority: 'Medium',
            submit: null,
        },
        validationSchema: validationSchema,
        onSubmit: async (values, helpers) => {
            try {
                const formData = new FormData();
                formData.append('title', values.title);
                formData.append('description', values.description);
                formData.append('category', values.category);
                formData.append('priority', values.priority);
                formData.append('userId', user.id || user._id);
                
                selectedFiles.forEach((file) => {
                    formData.append('attachments', file);
                });

                console.log('Submitting with userId:', user.id || user._id);

                const response = await submitTicket(formData).unwrap();

                setSubmittedTicket(response.ticket);
                setSubmitSuccess(true);
                helpers.setStatus({ success: true });
                
                // Redirect to view ticket status after 2 seconds
                setTimeout(() => {
                    navigate(`/applicant/tickets/${response.ticket.id}`);
                }, 2000);
            } catch (err) {
                const { data, error } = err;
                helpers.setStatus({ success: false });
                if (data) {
                    helpers.setErrors({ submit: data.error });
                }
                if (error) {
                    helpers.setErrors({ submit: 'Failed to submit ticket' });
                }
                helpers.setSubmitting(false);
            }
        },
    });

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <Card elevation={3}>
                    <CardHeader
                        title="Submit Ticket"
                        subheader="Create a new support ticket"
                    />
                    <CardContent>
                        {submitSuccess && submittedTicket && (
                            <Alert severity="success" sx={{ mb: 3 }}>
                                Ticket submitted successfully! Ticket ID: <strong>{submittedTicket.ticketId}</strong>
                                <br />
                                Redirecting to ticket details...
                            </Alert>
                        )}

                        {!submitSuccess && (
                            <form onSubmit={formik.handleSubmit}>
                                <Stack spacing={3}>
                                    <TextField
                                        error={!!(formik.touched.title && formik.errors.title)}
                                        fullWidth
                                        helperText={formik.touched.title && formik.errors.title}
                                        label="Title"
                                        name="title"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.title}
                                        required
                                    />

                                    <TextField
                                        error={!!(formik.touched.description && formik.errors.description)}
                                        fullWidth
                                        helperText={formik.touched.description && formik.errors.description}
                                        label="Description"
                                        name="description"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.description}
                                        multiline
                                        rows={6}
                                        required
                                    />

                                    <FormControl
                                        fullWidth
                                        error={!!(formik.touched.category && formik.errors.category)}
                                        required
                                    >
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            label="Category"
                                            name="category"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.category}
                                        >
                                            <MenuItem value="Technical">Technical</MenuItem>
                                            <MenuItem value="HR">HR</MenuItem>
                                            <MenuItem value="Administrative">Administrative</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </Select>
                                        {formik.touched.category && formik.errors.category && (
                                            <FormHelperText>{formik.errors.category}</FormHelperText>
                                        )}
                                    </FormControl>

                                    <FormControl fullWidth>
                                        <InputLabel>Priority</InputLabel>
                                        <Select
                                            label="Priority"
                                            name="priority"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.priority}
                                        >
                                            <MenuItem value="Low">Low</MenuItem>
                                            <MenuItem value="Medium">Medium</MenuItem>
                                            <MenuItem value="High">High</MenuItem>
                                            <MenuItem value="Urgent">Urgent</MenuItem>
                                        </Select>
                                    </FormControl>

                                    {/* File Upload Section */}
                                    <Box>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<AttachFileIcon />}
                                            fullWidth
                                        >
                                            Attach Images (Max 5 files, JPG/PNG only)
                                            <input
                                                type="file"
                                                hidden
                                                multiple
                                                accept="image/jpeg,image/jpg,image/png,image/gif"
                                                onChange={handleFileChange}
                                            />
                                        </Button>
                                        
                                        {selectedFiles.length > 0 && (
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Selected Files ({selectedFiles.length}/5):
                                                </Typography>
                                                <Stack spacing={1}>
                                                    {selectedFiles.map((file, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={`${file.name} (${(file.size / 1024).toFixed(2)} KB)`}
                                                            onDelete={() => removeFile(index)}
                                                            deleteIcon={<DeleteIcon />}
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                </Stack>
                                            </Box>
                                        )}
                                    </Box>

                                    {formik.errors.submit && (
                                        <Alert severity="error">{formik.errors.submit}</Alert>
                                    )}

                                    <Stack direction="row" spacing={2}>
                                        <Button
                                            fullWidth
                                            size="large"
                                            type="submit"
                                            variant="contained"
                                            disabled={isLoading || formik.isSubmitting}
                                        >
                                            {isLoading ? 'Submitting...' : 'Submit'}
                                        </Button>
                                        <Button
                                            fullWidth
                                            size="large"
                                            variant="outlined"
                                            onClick={() => navigate('/applicant/tickets')}
                                        >
                                            Cancel
                                        </Button>
                                    </Stack>
                                </Stack>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default SubmitTicket;
