const axios = require('axios');
const Applicant = require('../models/Applicant'); 

async function validateCertificateIntegrity(applicantId, certificateId) {
    try {
        const applicant = await Applicant.findOne({ email: applicantId });
        if (!applicant) throw new Error("Applicant not found");
        console.log(certificateId);
        const certificate = applicant.certificates.find(
            cert => cert.id === certificateId || cert._id.toString() === certificateId
        );
        if (!certificate) throw new Error("Certificate not found");
        if (!certificate.url) throw new Error("No image URL to scan");

        console.log(`Verifying QR & Data for: ${certificate.fileName}...`);

        const safeImageUrl = certificate.url.replace(/\.pdf$/i, '.jpg');

        console.log(`Sending data to Python service: ${safeImageUrl}`);

        try{
            const pythonResponse = await axios.post('http://127.0.0.1:8000/verify-qr-and-data', {
            image_url: safeImageUrl
            });
            result = pythonResponse.data;
            console.log(`Received response from Python service: ${JSON.stringify(pythonResponse.data)}`);
        }catch(err){
            console.error("Error communicating with Python service:", err.message);
            return null;
        }
        
        console.log(`Python Service Response: ${JSON.stringify(result)}`);
        if (result.is_verified) {
            certificate.status = 'Verified';
            certificate.actionRequired = 'None';
        }else if(result.status === "NO_QR_Link") {
            certificate.status = 'QR & Link Detected | Pending';
            certificate.actionRequired = 'Module comping soon..';
        }
         else {
            certificate.status = 'Not Verified';
            certificate.actionRequired = `Manual Review: ${result.reason}`; 
        }

        await applicant.save();

        console.log(`Validation Complete: ${result.status} - ${result.reason}`);
        return certificate;

    } catch (error) {
        console.error("❌ Integrity Check Failed:", error.message);
        return null;
    }
}

module.exports = { validateCertificateIntegrity };