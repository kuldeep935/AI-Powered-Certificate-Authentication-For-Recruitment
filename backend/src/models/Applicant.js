const mongoose = require('mongoose');

const ApplicantSchema = new mongoose.Schema({
    email : String,
    password : String,

    resumeUrl: { 
      type: String, 
      default: '' 
    },

    fileName: {
      type: String,
      default: 'Not uploaded'
    },

    certificates: [
      {
        id: { type: String },
        fileName: { type: String },
        url: { type: String },
        status: { type: String, default: 'Pending' },
        uploadedDate: { type: String },
        actionRequired: { type: String, default: 'No Action Required' },
      }
    ]
});

module.exports = mongoose.model('Applicant', ApplicantSchema); 