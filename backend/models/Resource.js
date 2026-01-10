const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required']
  },
  description: {
    type: String,
    required: [true, 'Resource description is required']
  },
  level: {
    type: String,
    enum: ['KS3', 'GCSE', 'A-Level', 'All'],
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileType: {
    type: String,
    enum: ['pdf', 'video', 'document', 'link'],
    default: 'pdf'
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
