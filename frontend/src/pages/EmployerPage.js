import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserCircle, Bell, Plus, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const initialJobPosts = [
  {
    id: 'jd001',
    jobRole: 'Java Developer',
    vacancy: 2,
    startDate: '12/09/2025',
    endDate: '12/10/2025',
  },
  {
    id: 'fd002',
    jobRole: 'Frontend Developer',
    vacancy: 1,
    startDate: '02/10/2025',
    endDate: '12/10/2025',
  },
];

const JobCard = ({ job, onDelete }) => {
  const { id, jobRole, vacancy, startDate, endDate } = job;

  const handleGetApplicantData = () => {
    console.log(`Getting applicant data for: ${jobRole} (${id})`);
    alert(`Redirecting to applicant data for: ${jobRole}`);
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 mb-4 bg-gray-100 rounded-xl shadow-md border-l-4 border-blue-500 transition hover:shadow-lg">
      
      <div className="flex-grow text-gray-800 mb-3 md:mb-0">
        <p className="text-lg font-semibold text-gray-900">Job Role : {jobRole}</p>
        <p className="text-sm text-gray-600">vacancy : <span className="font-medium text-blue-700">{vacancy.toString().padStart(2, '0')}</span></p>
        <p className="text-sm text-gray-600">Start Date : {startDate}</p>
        <p className="text-sm text-gray-600">End Date : {endDate}</p>
      </div>

      <div className="flex items-center space-x-4">
        
        <button
          onClick={handleGetApplicantData}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400 hover:text-white transition duration-150 shadow-sm"
        >
          Get Applicant Data
        </button>

        <button
          onClick={() => onDelete(id, jobRole)}
          className="p-2 text-gray-500 transition duration-150 rounded-full hover:text-red-600 hover:bg-gray-200"
          aria-label={`Delete job post for ${jobRole}`}
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [jobPosts, setJobPosts] = useState(initialJobPosts);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [companyNameInput, setCompanyNameInput] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [salary, setSalary] = useState('');
  const [vacancy, setVacancy] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');

  const organizationName = "AI-CertiAuth";
  const company = localStorage.getItem('userEmail') || '';
  const companyName = `${company}`;
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('userEmail')) {
      navigate('/login');
      return;
    }
    document.title = 'Employer Dashboard - AI-CertiAuth';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  const handleAddNewPost = () => {
    setShowForm(true);
  };

  const handleSubmitJob = async (e) => {
    e.preventDefault();
    if (!title || !companyNameInput) return alert('Please provide a job title and company name');
    setPosting(true);
    const payload = {
      title,
      description,
      company: companyNameInput,
      location,
      tags,
      salary,
      vacancy,
      startDate,
      endDate,
      postedBy: companyNameInput
    };

    console.log('Posting job payload:', payload);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/jobs`, payload);
      console.log('POST /api/jobs response:', res);

      if (res.data && res.data.success) {
        const job = res.data.job;
        setJobPosts(prev => [
          {
            id: job._id,
            jobRole: job.title,
            vacancy: vacancy || 1,
            startDate: startDate ? new Date(startDate).toLocaleDateString() : (job.startDate ? new Date(job.startDate).toLocaleDateString() : new Date(job.postedAt).toLocaleDateString()),
            endDate: endDate ? new Date(endDate).toLocaleDateString() : (job.endDate ? new Date(job.endDate).toLocaleDateString() : 'Open'),
            raw: job
          },
          ...prev
        ]);
        setShowForm(false);
        setTitle(''); setCompanyNameInput(''); setLocation(''); setDescription(''); setTags(''); setSalary(''); setVacancy(1); setStartDate(''); setEndDate('');
        setPostError('');
        alert('Job posted successfully');
      } else {
        const message = res.data && res.data.message ? res.data.message : 'Failed to post job';
        setPostError(message);
        alert(`Failed to post job: ${message}`);
      }
    } catch (err) {
      console.error('Post job error:', err);
      const serverMessage = err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message;
      setPostError(serverMessage);
      alert(`Error while posting job: ${serverMessage}`);
    } finally {
      setPosting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setTitle(''); setCompanyNameInput(''); setLocation(''); setDescription(''); setTags(''); setSalary('');
  };

  const handleDeletePost = (id, roleName) => {
    if (window.confirm(`Are you sure you want to delete the job post for ${roleName}?`)) {
      setJobPosts(jobPosts.filter(post => post.id !== id));
      console.log(`Deleted post: ${id}`);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      
      <header className="flex items-center justify-between px-6 py-4 bg-blue-900 text-white shadow-xl sticky top-0 z-10">
        <h1 className="text-2xl font-extrabold tracking-wider">{organizationName}</h1>
        <nav className="flex items-center space-x-6">
          {/* <Link to={"/about"} className="text-gray-300 hover:text-white transition hidden sm:inline">About</Link>
          <Link to={"/feature"} className="text-gray-300 hover:text-white transition hidden sm:inline">Features</Link>
          <Link to={"/"} className="text-gray-300 hover:text-white transition hidden sm:inline">Contact</Link> */}
          
          <div className="flex items-center space-x-4 border-l border-gray-700 pl-4">
            <Link to="/verify" className="text-gray-300 hover:text-white transition hidden sm:inline">Verify</Link>
            <span className="text-sm font-medium hidden md:inline">Profile</span>
            <UserCircle className="w-6 h-6 cursor-pointer hover:text-blue-300" />
            <Bell className="w-6 h-6 cursor-pointer hover:text-blue-300" />
          </div>
        </nav>
      </header>

      <main className="container max-w-4xl px-4 py-8 mx-auto flex-grow">
        
        <h2 className="mb-6 text-2xl font-light text-gray-700">
          Hii <span className="font-semibold text-gray-900">{companyName}</span>
        </h2>

        <div>
          {!showForm ? (
            <div onClick={handleAddNewPost} className="flex items-center w-full max-w-xs p-4 mb-4 border-2 border-gray-400 border-dashed rounded-lg cursor-pointer bg-white hover:bg-blue-50 transition duration-200 shadow-inner">
              <Plus className="w-8 h-8 text-gray-600 mr-3 border-2 border-gray-600 rounded-md p-0.5" />
              <span className="text-lg font-medium text-gray-700">Add new job post</span>
            </div>
          ) : (
            <form onSubmit={handleSubmitJob} className="p-4 mb-6 bg-white rounded-lg shadow border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={title} onChange={(e)=>setTitle(e.target.value)} required placeholder="Job title" className="p-2 border rounded" />
                <input value={companyNameInput} onChange={(e)=>setCompanyNameInput(e.target.value)} required placeholder="Company name" className="p-2 border rounded" />
                <input value={location} onChange={(e)=>setLocation(e.target.value)} placeholder="Location" className="p-2 border rounded" />
                <input value={salary} onChange={(e)=>setSalary(e.target.value)} placeholder="Salary (optional)" className="p-2 border rounded" />
                <input value={tags} onChange={(e)=>setTags(e.target.value)} placeholder="Tags (comma separated)" className="p-2 border rounded" />
                <input type="number" min={1} value={vacancy} onChange={(e)=>setVacancy(parseInt(e.target.value || '1', 10))} className="p-2 border rounded" placeholder="Vacancy" />
                <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="p-2 border rounded" placeholder="Start Date" />
                <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="p-2 border rounded" placeholder="End Date" />
              </div>
              <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Job description" className="w-full mt-4 p-2 border rounded" rows={6} />
              {postError && <div className="mt-3 text-red-600 font-medium">Error: {postError}</div>}
              <div className="flex items-center space-x-2 mt-4">
                <button type="submit" disabled={posting} className="px-4 py-2 bg-blue-600 text-white rounded">{posting ? 'Posting...' : 'Post Job'}</button>
                <button type="button" onClick={handleCancelForm} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              </div>
            </form>
          )}
        </div>

        <h3 className="mb-5 text-xl font-bold text-gray-800 border-b pb-2">
          Your uploaded job posts :
        </h3>

        <div className="space-y-4">
          {jobPosts.length > 0 ? (
            jobPosts.map(job => (
              <JobCard key={job.id} job={job} onDelete={handleDeletePost} />
            ))
          ) : (
            <div className="text-center p-8 text-gray-500 bg-white rounded-xl shadow-md">
                No active job posts found. Click "Add new job post" to get started!
            </div>
          )}
        </div>
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

