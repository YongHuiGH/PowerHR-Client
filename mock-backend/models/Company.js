import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zip: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    employees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    departments: [{
        name: String,
        description: String,
        head: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
}, {
    timestamps: true
});

const Company = mongoose.model('Company', companySchema);

export default Company;
