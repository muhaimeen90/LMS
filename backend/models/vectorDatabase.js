import mongoose from 'mongoose';

const vectorEntrySchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    // We'll store the vector ID from Pinecone here
    vectorId: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

export default mongoose.model('VectorEntry', vectorEntrySchema);