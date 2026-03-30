import React, { useState } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import { UserCircle, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

export default function SearchJobs() {
  const [q, setQ] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');

  const search = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/jobs?q=${encodeURIComponent(q)}`);
      const items = Array.isArray(res.data) ? res.data : (res.data.jobs || res.data.data || res.data);
      setJobs(items || []);
    } catch (err) {
      console.error('Search error', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (job) => setSelectedJob(job);
  const closeDetail = () => {
    setSelectedJob(null);
    setApplyMessage('');
  };

  const handleApply = async (job) => {
    const email = localStorage.getItem('userEmail');
    const resumeUrl = localStorage.getItem('resumeUrl') || '';
    if (!email) return alert('Please login as applicant to apply');

    setApplying(true);
    setApplyMessage('');
    try {
      setApplyMessage(
        `Application prepared for ${job.title}. Resume: ${resumeUrl ? 'attached' : 'missing'}.`
      );
    } catch (err) {
      console.error('Apply error', err);
      const msg = err.response?.data?.message || err.message || 'Failed to apply';
      setApplyMessage(`Error: ${msg}`);
    } finally {
      setApplying(false);
    }
  };
  
  const organizationName = "AI-CertiAuth";

  return (
    // <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
    //   <header className="flex items-center justify-between px-6 py-4 bg-blue-900 text-white shadow-xl sticky top-0 z-10">
    //     <h1 className="text-2xl font-extrabold tracking-wider">{organizationName}</h1>
    //     <nav className="flex items-center space-x-6">
    //       <Link to="/jobs" className="text-gray-300 hover:text-white transition hidden sm:inline">Search Jobs</Link>
          
    //       <div className="flex items-center space-x-4 border-l border-gray-700 pl-4">
    //         <span className="text-sm font-medium hidden md:inline">Profile</span>
    //         <UserCircle className="w-6 h-6 cursor-pointer hover:text-blue-300" />
    //         <Bell className="w-6 h-6 cursor-pointer hover:text-blue-300" />
    //       </div>
    //     </nav>
    //   </header>
    //   <div className="max-w-4xl mx-auto">
    //     <h2 className="text-2xl font-semibold mb-4">Search Jobs</h2>
    //     <SearchBar value={q} onChange={setQ} onSearch={search} />

    //     {loading && <div className="mt-4 text-sm text-gray-500">Loading...</div>}
    //     {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

    //     <div className="space-y-4 mt-6">
    //       {jobs.length === 0 && !loading ? (
    //         <div className="text-gray-500">No jobs found. Try a different search term.</div>
    //       ) : (
    //         jobs.map(job => (
    //           <JobCard key={job._id || job.id || job.title} job={job} onOpen={openDetail} onApply={handleApply} />
    //         ))
    //       )}
    //     </div>
    //   </div>

    //   {selectedJob && (
    //     <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
    //       <div className="bg-white max-w-2xl w-full p-6 rounded-md shadow-lg">
    //         <div className="flex justify-between items-start">
    //           <h3 className="text-xl font-semibold">{selectedJob.title}</h3>
    //           <button onClick={closeDetail} className="text-gray-500">Close</button>
    //         </div>
    //         <div className="mt-2 text-sm text-gray-600">{selectedJob.company} • {selectedJob.location}</div>
    //         <div className="mt-4 text-gray-800">{selectedJob.description}</div>

    //         <div className="mt-4 flex items-center space-x-2">
    //           <button onClick={() => handleApply(selectedJob)} disabled={applying} className="px-4 py-2 bg-blue-600 text-white rounded">
    //             {applying ? 'Applying...' : 'Apply'}
    //           </button>
    //           <button onClick={closeDetail} className="px-4 py-2 bg-gray-200 rounded">Close</button>
    //         </div>

    //         {applyMessage && <div className="mt-3 text-sm text-green-600">{applyMessage}</div>}
    //       </div>
    //     </div>
    //   )}
    //   <footer className="w-full text-white bg-blue-900 mt-12 py-3 relative">
    //       <div className="flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto px-6">
    //           <div className="py-1 text-sm text-gray-300">
    //               &copy; {organizationName} all rights reserved
    //           </div>
              
    //           <div className="text-sm font-bold text-orange-400 text-shadow-md">
    //               Authenticity Meets Opportunity.
    //           </div>
    //       </div>
    //   </footer>
    // </div>
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
          
          <header className="flex items-center justify-between px-6 py-4 bg-blue-900 text-white shadow-xl sticky top-0 z-10">
            <h1 className="text-2xl font-extrabold tracking-wider">{organizationName}</h1>
            <nav className="flex items-center space-x-6">
              <Link to="/jobs" className="text-gray-300 hover:text-white transition hidden sm:inline">Search Jobs</Link>
              
              <div className="flex items-center space-x-4 border-l border-gray-700 pl-4">
                <span className="text-sm font-medium hidden md:inline">Profile</span>
                <UserCircle className="w-6 h-6 cursor-pointer hover:text-blue-300" />
                <Bell className="w-6 h-6 cursor-pointer hover:text-blue-300" />
              </div>
            </nav>
          </header>
    
          <main className="container max-w-5xl px-4 py-8 mx-auto flex-grow">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Search Jobs</h2>
              <SearchBar value={q} onChange={setQ} onSearch={search} />

              {loading && <div className="mt-4 text-sm text-gray-500">Loading...</div>}
              {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

              <div className="space-y-4 mt-6">
                {jobs.length === 0 && !loading ? (
                  <div className="text-gray-500">No jobs found. Try a different search term./ Click search to get all jobs.</div>
                ) : (
                  jobs.map(job => (
                    <JobCard key={job._id || job.id || job.title} job={job} onOpen={openDetail} onApply={handleApply} />
                  ))
                )}
              </div>
            </div>

            {selectedJob && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                <div className="bg-white max-w-2xl w-full p-6 rounded-md shadow-lg">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{selectedJob.title}</h3>
                    <button onClick={closeDetail} className="text-gray-500">Close</button>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">{selectedJob.company} • {selectedJob.location}</div>
                  <div className="mt-4 text-gray-800">{selectedJob.description}</div>

                  <div className="mt-4 flex items-center space-x-2">
                    <button onClick={() => handleApply(selectedJob)} disabled={applying} className="px-4 py-2 bg-blue-600 text-white rounded">
                      {applying ? 'Applying...' : 'Apply'}
                    </button>
                    <button onClick={closeDetail} className="px-4 py-2 bg-gray-200 rounded">Close</button>
                  </div>

                  {applyMessage && <div className="mt-3 text-sm text-green-600">{applyMessage}</div>}
                </div>
              </div>
            )}
          </main>
    
          <footer className="w-full text-white bg-blue-900 mt-12 py-3 relative">
              <div className="flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto px-6">
                  <div className="py-1 text-sm text-gray-300">
                      &copy; {organizationName} all rights reserved
                  </div>
                  
                  <div className="text-sm font-bold text-orange-400 text-shadow-md">
                      Authenticity Meets Opportunity.
                  </div>
              </div>
          </footer>
        </div>
  );
}

