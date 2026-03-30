async function validateAllCertificates() {
    console.log("🚀 Starting bulk validation sweep...");
    
    let stats = {
        totalProcessed: 0,
        verified: 0,
        failed: 0,
        skipped: 0
    };

    try {

        const applicants = await Applicant.find({ 
            "certificates": { $exists: true, $not: {$size: 0} } 
        });

        console.log(`Found ${applicants.length} applicants with certificates. Processing...`);

        for (const applicant of applicants) {
            for (const cert of applicant.certificates) {
                
                if (cert.status === 'Verified') {
                    stats.skipped++;
                    continue;
                }

                if (!cert.url) {
                    console.log(`⚠️ Skipping cert ${cert._id}: No image URL`);
                    stats.skipped++;
                    continue;
                }

                console.log(`⏳ Validating [${applicant.email}] - ${cert.fileName}...`);
                
                const result = await validateCertificateIntegrity(applicant._id, cert._id);
                
                stats.totalProcessed++;

                if (result && result.status === 'Verified') {
                    stats.verified++;
                } else {
                    stats.failed++;
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log("✅ Bulk validation sweep complete!");
        console.log(`📊 Results: ${stats.totalProcessed} processed | ${stats.verified} verified | ${stats.failed} failed | ${stats.skipped} skipped`);
        
        return stats;

    } catch (error) {
        console.error("❌ Fatal error during bulk sweep:", error.message);
        throw error;
    }
}

module.exports = { 
    validateCertificateIntegrity, 
    validateAllCertificates 
};