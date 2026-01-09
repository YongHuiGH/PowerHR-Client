import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Ticket from './models/Ticket.js';
import Company from './models/Company.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'));
        }
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Helper function to generate mock token
const generateToken = (userId) => {
    return `mock-token-${userId}-${Date.now()}`;
};

// Register endpoint
app.post('/auth/register/applicant', async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, gender } = req.body;

        // Validate confirmPassword matches
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            password, // Will be hashed by the pre-save hook
            gender,
            role: 'applicant'
        });

        await user.save();

        console.log(`✅ User registered: ${email}`);
        res.status(201).json({ 
            message: 'Registration successful',
            user: { 
                email: user.email, 
                firstName: user.firstName, 
                lastName: user.lastName 
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user._id);
        
        console.log(`✅ User logged in: ${email}`);
        res.status(200).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                gender: user.gender
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Forgot password endpoint (mock - just returns success)
app.post('/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    console.log(`📧 Password reset requested for: ${email}`);
    res.status(200).json({ message: 'Password reset email sent' });
});

// Change password endpoint (mock)
app.post('/auth/change-password/:id', (req, res) => {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;
    
    console.log(`🔑 Password change requested for user: ${id}`);
    res.status(200).json({ message: 'Password changed successfully' });
});

// Health check
app.get('/health', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.json({ 
            status: 'ok', 
            message: 'Mock backend is running',
            database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            users: userCount 
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// List all users (for debugging)
app.get('/debug/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const userList = users.map(u => ({
            id: u._id,
            email: u.email,
            name: `${u.firstName} ${u.lastName}`,
            role: u.role,
            gender: u.gender,
            createdAt: u.createdAt
        }));
        res.json({ users: userList, total: users.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ TICKET ENDPOINTS ============

// Submit ticket (Create) - with file upload
app.post('/tickets', upload.array('attachments', 5), async (req, res) => {
    try {
        const { title, description, priority, category, userId } = req.body;

        console.log('Received ticket submission:', { title, userId, filesCount: req.files?.length });

        // Get user info
        const user = await User.findById(userId);
        if (!user) {
            console.error('User not found with ID:', userId);
            return res.status(404).json({ error: 'User not found' });
        }

        // Process uploaded files
        const attachments = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: `/uploads/${file.filename}`,
            mimetype: file.mimetype,
            size: file.size
        })) : [];

        const ticket = new Ticket({
            title,
            description,
            priority: priority || 'Medium',
            category,
            submittedBy: userId,
            submittedByEmail: user.email,
            submittedByName: `${user.firstName} ${user.lastName}`,
            status: 'Pending',
            attachments
        });

        await ticket.save();

        console.log(`✅ Ticket created: ${ticket.ticketId} - ${ticket.title} (${attachments.length} attachments)`);
        res.status(201).json({ 
            message: 'Ticket submitted successfully',
            ticket: {
                id: ticket._id,
                ticketId: ticket.ticketId,
                title: ticket.title,
                description: ticket.description,
                status: ticket.status,
                priority: ticket.priority,
                category: ticket.category,
                attachments: ticket.attachments,
                createdAt: ticket.createdAt
            }
        });
    } catch (error) {
        console.error('Submit ticket error:', error);
        res.status(500).json({ error: 'Failed to submit ticket: ' + error.message });
    }
});

// Get all tickets for a user
app.get('/tickets/user/:userId', async (req, res) => {
    try {
        const tickets = await Ticket.find({ submittedBy: req.params.userId })
            .sort({ createdAt: -1 });

        res.json({ 
            tickets: tickets.map(t => ({
                id: t._id,
                ticketId: t.ticketId,
                title: t.title,
                description: t.description,
                status: t.status,
                priority: t.priority,
                category: t.category,
                createdAt: t.createdAt,
                updatedAt: t.updatedAt
            })),
            total: tickets.length 
        });
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({ error: error.message });
    }
});

// View ticket status (Get single ticket by ID)
app.get('/tickets/:id', async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('submittedBy', 'firstName lastName email');

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        res.json({ 
            ticket: {
                id: ticket._id,
                ticketId: ticket.ticketId,
                title: ticket.title,
                description: ticket.description,
                status: ticket.status,
                priority: ticket.priority,
                category: ticket.category,
                submittedBy: ticket.submittedBy,
                submittedByEmail: ticket.submittedByEmail,
                submittedByName: ticket.submittedByName,
                attachments: ticket.attachments,
                createdAt: ticket.createdAt,
                updatedAt: ticket.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all tickets (for admin/employee to view all tickets)
app.get('/tickets', async (req, res) => {
    try {
        const { status, priority, category } = req.query;
        
        // Build filter
        const filter = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (category) filter.category = category;

        const tickets = await Ticket.find(filter)
            .populate('submittedBy', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.json({ 
            tickets: tickets.map(t => ({
                id: t._id,
                ticketId: t.ticketId,
                title: t.title,
                description: t.description,
                status: t.status,
                priority: t.priority,
                category: t.category,
                submittedByEmail: t.submittedByEmail,
                submittedByName: t.submittedByName,
                createdAt: t.createdAt,
                updatedAt: t.updatedAt
            })),
            total: tickets.length 
        });
    } catch (error) {
        console.error('Get all tickets error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update ticket (for admin/employee)
app.put('/tickets/:id', upload.array('newAttachments', 5), async (req, res) => {
    try {
        const { title, description, status, priority, category } = req.body;
        
        const ticket = await Ticket.findById(req.params.id);
        
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Update fields if provided
        if (title) ticket.title = title;
        if (description) ticket.description = description;
        if (status) ticket.status = status;
        if (priority) ticket.priority = priority;
        if (category) ticket.category = category;

        // Add new attachments if any
        if (req.files && req.files.length > 0) {
            const newAttachments = req.files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                path: `/uploads/${file.filename}`,
                mimetype: file.mimetype,
                size: file.size
            }));
            ticket.attachments = [...(ticket.attachments || []), ...newAttachments];
        }

        await ticket.save();

        console.log(`✅ Ticket updated: ${ticket.ticketId} - ${ticket.title}`);
        res.json({ 
            message: 'Ticket updated successfully',
            ticket: {
                id: ticket._id,
                ticketId: ticket.ticketId,
                title: ticket.title,
                description: ticket.description,
                status: ticket.status,
                priority: ticket.priority,
                category: ticket.category,
                attachments: ticket.attachments,
                updatedAt: ticket.updatedAt
            }
        });
    } catch (error) {
        console.error('Update ticket error:', error);
        res.status(500).json({ error: 'Failed to update ticket: ' + error.message });
    }
});

// Close ticket (for admin/employee)
app.patch('/tickets/:id/close', async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        ticket.status = 'Closed';
        await ticket.save();

        console.log(`✅ Ticket closed: ${ticket.ticketId} - ${ticket.title}`);
        res.json({ 
            message: 'Ticket closed successfully',
            ticket: {
                id: ticket._id,
                ticketId: ticket.ticketId,
                title: ticket.title,
                status: ticket.status,
                updatedAt: ticket.updatedAt
            }
        });
    } catch (error) {
        console.error('Close ticket error:', error);
        res.status(500).json({ error: 'Failed to close ticket: ' + error.message });
    }
});

// Generate ticket report with filters
app.post('/tickets/report/generate', async (req, res) => {
    try {
        const { startDate, endDate, category, status, priority } = req.body;

        // Build filter query
        const filter = {};
        
        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // Include the entire end date
                filter.createdAt.$lte = end;
            }
        }
        
        // Category filter
        if (category && category !== 'All') filter.category = category;
        
        // Status filter
        if (status && status !== 'All') filter.status = status;
        
        // Priority filter
        if (priority && priority !== 'All') filter.priority = priority;

        // Fetch tickets matching criteria
        const tickets = await Ticket.find(filter)
            .populate('submittedBy', 'firstName lastName email')
            .sort({ createdAt: -1 });

        // Generate statistics
        const stats = {
            totalTickets: tickets.length,
            byStatus: {},
            byPriority: {},
            byCategory: {},
            averageResolutionTime: 0
        };

        // Calculate statistics
        let totalResolutionTime = 0;
        let resolvedCount = 0;

        tickets.forEach(ticket => {
            // Count by status
            stats.byStatus[ticket.status] = (stats.byStatus[ticket.status] || 0) + 1;
            
            // Count by priority
            stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1;
            
            // Count by category
            stats.byCategory[ticket.category] = (stats.byCategory[ticket.category] || 0) + 1;

            // Calculate resolution time for resolved/closed tickets
            if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
                const resolutionTime = ticket.updatedAt - ticket.createdAt;
                totalResolutionTime += resolutionTime;
                resolvedCount++;
            }
        });

        // Average resolution time in hours
        if (resolvedCount > 0) {
            stats.averageResolutionTime = Math.round(totalResolutionTime / resolvedCount / (1000 * 60 * 60) * 10) / 10;
        }

        console.log(`📊 Ticket report generated: ${tickets.length} tickets found`);
        
        res.json({
            success: true,
            reportData: {
                tickets: tickets.map(t => ({
                    id: t._id,
                    ticketId: t.ticketId,
                    title: t.title,
                    description: t.description,
                    category: t.category,
                    priority: t.priority,
                    status: t.status,
                    submittedBy: t.submittedByName,
                    submittedByEmail: t.submittedByEmail,
                    createdAt: t.createdAt,
                    updatedAt: t.updatedAt,
                    attachmentsCount: t.attachments?.length || 0
                })),
                statistics: stats,
                filters: {
                    startDate,
                    endDate,
                    category: category || 'All',
                    status: status || 'All',
                    priority: priority || 'All'
                },
                generatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({ error: 'Failed to generate report: ' + error.message });
    }
});

// ============ COMPANY ENDPOINTS ============

// Check if company email exists
app.post('/company/check', async (req, res) => {
    try {
        const { email } = req.body;
        const company = await Company.findOne({ email });
        
        if (company) {
            return res.status(200).json({ 
                exists: true,
                message: 'Company email already registered'
            });
        }
        
        res.status(200).json({ 
            exists: false,
            message: 'Email is available'
        });
    } catch (error) {
        console.error('Check company error:', error);
        res.status(500).json({ error: 'Failed to check company: ' + error.message });
    }
});

// Register a new company
app.post('/company/register', async (req, res) => {
    try {
        const { name, email, phone, address, policy } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !address) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if company email already exists
        const existingCompany = await Company.findOne({ email });
        if (existingCompany) {
            return res.status(409).json({ error: 'Company email already registered' });
        }

        // Check if user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered as a user' });
        }

        // Generate random password (8-12 characters with letters and numbers)
        const generatePassword = () => {
            const length = Math.floor(Math.random() * 5) + 8; // 8-12 characters
            const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let password = '';
            for (let i = 0; i < length; i++) {
                password += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            return password;
        };

        const defaultPassword = generatePassword();

        // Create new company
        const company = new Company({
            name,
            email,
            phone,
            address: {
                street: address.street,
                city: address.city,
                state: address.state,
                zip: address.zip,
                country: address.country
            },
            isActive: true
        });

        await company.save();

        // Create owner/admin user for the company
        const ownerUser = new User({
            email: email,
            password: defaultPassword, // Will be hashed by User model pre-save hook
            firstName: name.split(' ')[0] || 'Admin',
            lastName: name.split(' ').slice(1).join(' ') || 'User',
            role: 'admin', // Company owner is admin
            gender: 'Other',
            company: company._id
        });

        await ownerUser.save();

        // Link user to company
        company.employees.push(ownerUser._id);
        await company.save();

        console.log(`✅ Company registered: ${name} - ${email}`);
        console.log(`👤 Owner account created with temporary password`);
        
        res.status(201).json({
            message: 'Company registered successfully',
            company: {
                id: company._id,
                name: company.name,
                email: company.email,
                phone: company.phone,
                address: company.address,
                isActive: company.isActive
            },
            credentials: {
                email: email,
                password: defaultPassword,
                message: 'Please save this password and change it after your first login'
            }
        });
    } catch (error) {
        console.error('Company registration error:', error);
        res.status(500).json({ error: 'Failed to register company: ' + error.message });
    }
});

// Get company by ID// Get company by ID
app.get('/company/:id', async (req, res) => {
    try {
        const company = await Company.findById(req.params.id)
            .populate('employees', 'firstName lastName email role');

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        res.json({
            company: {
                id: company._id,
                name: company.name,
                email: company.email,
                phone: company.phone,
                address: company.address,
                isActive: company.isActive,
                employees: company.employees,
                departments: company.departments,
                createdAt: company.createdAt,
                updatedAt: company.updatedAt
            }
        });
    } catch (error) {
        console.error('Get company error:', error);
        res.status(500).json({ error: 'Failed to get company: ' + error.message });
    }
});

// Update company
app.put('/company/:id', async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        
        const company = await Company.findById(req.params.id);
        
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        // Update fields if provided
        if (name) company.name = name;
        if (email) company.email = email;
        if (phone) company.phone = phone;
        if (address) company.address = address;

        await company.save();

        console.log(`✅ Company updated: ${company.name}`);
        res.json({
            message: 'Company updated successfully',
            company: {
                id: company._id,
                name: company.name,
                email: company.email,
                phone: company.phone,
                address: company.address,
                updatedAt: company.updatedAt
            }
        });
    } catch (error) {
        console.error('Update company error:', error);
        res.status(500).json({ error: 'Failed to update company: ' + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Mock PowerHR Backend running on http://localhost:${PORT}`);
    console.log(`📝 Register at: http://localhost:${PORT}/auth/register/applicant`);
    console.log(`🔐 Login at: http://localhost:${PORT}/auth/login`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log(`\n📌 To view registered users: http://localhost:${PORT}/debug/users\n`);
});
