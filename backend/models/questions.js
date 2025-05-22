import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    Question: {
        type: String,
        required: true
    },
    Explanation: {
        type: String,
        required: true
    },
    isTrue:{
        type: Boolean,
        required: true
    },
    count: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

export default mongoose.model('Question', questionSchema);