import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
        default: 'Pending'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    category: {
        type: String,
        enum: ['Technical Issue', 'Account', 'Payroll', 'Leave Request', 'Benefits', 'Other'],
        required: true
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submittedByEmail: String,
    submittedByName: String,
    attachments: [{
        filename: String,
        originalName: String,
        path: String,
        mimetype: String,
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Auto-generate ticket ID before saving
ticketSchema.pre('save', async function(next) {
    if (!this.ticketId) {
        const count = await mongoose.model('Ticket').countDocuments();
        this.ticketId = `TKT-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
