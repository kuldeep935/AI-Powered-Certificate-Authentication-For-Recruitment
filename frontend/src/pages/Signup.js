import React, { useState } from 'react';
import { Mail, Lock, User, Building, Landmark, LogIn, Key, Briefcase, Hash } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const Header = () => (
    <header className="bg-blue-800 text-white shadow-lg p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold tracking-wider">AI-CertiAuth</h1>
            <nav>
                <ul className="flex space-x-6 text-sm font-medium">
                    <li><Link to={"/about"} className="hover:text-gray-300 transition">About</Link></li>
                    <li><Link to={"/feature"} className="hover:text-gray-300 transition">Features</Link></li>
                    <li><Link to={"/"} className="hover:text-gray-300 transition">Contact</Link></li>
                </ul>
            </nav>
        </div>
    </header>
);

const Footer = () => (
    <footer className="bg-blue-900 text-gray-300 py-4 text-center text-sm font-semibold mt-auto">
        <div className="text-xl font-bold text-red-600 mb-2">Authenticity Meets Opportunity.</div>
        <p>@AI-CertiAuth all rights reserved</p>
    </footer>
);

const RoleSelector = ({ role, setRole }) => {
    const roles = [
        { key: 'Applicant', icon: User },
        { key: 'Employer', icon: Building },
        { key: 'Institution', icon: Landmark }
    ];

    return (
        <div className="flex justify-between w-full mb-8 space-x-2">
            {roles.map((r) => (
                <button
                    key={r.key}
                    onClick={() => setRole(r.key)}
                    className={`flex flex-col items-center p-3 sm:p-4 rounded-xl transition-all duration-300 w-1/3 text-center border-2 
                        ${role === r.key 
                            ? 'bg-blue-800 border-blue-900 text-white shadow-lg scale-105' 
                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    <r.icon className="w-5 h-5 mb-1 sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-sm font-semibold">{r.key}</span>
                </button>
            ))}
        </div>
    );
};

const FormInput = ({ label, type = 'text', name, value, onChange, placeholder, icon: Icon }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label} :</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-inner focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder={placeholder}
                required
            />
        </div>
    </div>
);

const FormButton = ({ loading }) => (
    <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center bg-blue-800 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-900 transition duration-200 disabled:opacity-50"
    >
        {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ) : (
            <><LogIn className="w-5 h-5 mr-2" /> Register</>
        )}
    </button>
);

const ApplicantForm = ({ setLoading, setMessage, loading }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setMessage('Error: Passwords do not match.');
        }
        setMessage('');
        setLoading(true);

        try{
            const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
                ...formData,
                role: 'Applicant'
            });
            setMessage(response.data.message || 'Registration successfull');
            if(response.status === 201){
                navigate("/applicantPage");
            }
        }
        catch(err){
            setMessage(err.response?.data?.message || 'Error occured during registration.');
        }
        finally{
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput label="Email" type="email" icon={Mail} name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
            <FormInput label="Password" type="password" icon={Lock} name="password" value={formData.password} onChange={handleChange} placeholder="********" />
            <FormInput label="Confirm Password" type="password" icon={Key} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="********" />
            <FormButton loading={loading} />
        </form>
    );
};

const EmployerForm = ({ setLoading, setMessage, loading }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ companyName: '', email: '', password: '', confirmPassword: '' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setMessage('Error: Passwords do not match.');
        }
        setMessage('');
        setLoading(true);

        try{
            const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
                ...formData,
                role: 'Employer',
            });
            setMessage(response.data.message || 'Registration successfull');
            if(response.status === 201){
                navigate("/employerPage");
            }
        }
        catch(err){
            setMessage(err.response?.data?.message || 'Error occured during registration.');
        }
        finally{
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput label="Organization/Company Name" type="text" icon={Briefcase} name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Tech Solutions Inc." />
            <FormInput label="Email" type="email" icon={Mail} name="email" value={formData.email} onChange={handleChange} placeholder="hr@techsolutions.com" />
            <FormInput label="Password" type="password" icon={Lock} name="password" value={formData.password} onChange={handleChange} placeholder="********" />
            <FormInput label="Confirm Password" type="password" icon={Key} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="********" />
            <FormButton loading={loading} />
        </form>
    );
};

const InstitutionForm = ({ setLoading, setMessage, loading }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ institutionName: '', email: '', password: '', confirmPassword: '' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setMessage('Error: Passwords do not match.');
        }
        setMessage('');
        setLoading(true);

        try{
            const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
                ...formData,
                role: 'Institution',
            });
            setMessage(response.data.message || 'Registration successfull');
            if(response.status === 201){
                navigate("/institutePage");
            }
        }
        catch(err){
            setMessage(err.response?.data?.message || 'Error occured during registration.');
        }
        finally{
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput label="Institution Name" type="text" icon={Hash} name="institutionName" value={formData.institutionName} onChange={handleChange} placeholder="University of Science" />
            <FormInput label="Email" type="email" icon={Mail} name="email" value={formData.email} onChange={handleChange} placeholder="registrar@uni.edu" />
            <FormInput label="Password" type="password" icon={Lock} name="password" value={formData.password} onChange={handleChange} placeholder="********" />
            <FormInput label="Confirm Password" type="password" icon={Key} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="********" />
            <FormButton loading={loading} />
        </form>
    );
};


const SignupPage = () => {
    const [role, setRole] = useState('Applicant'); 
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    const renderForm = () => {
        const formProps = { setLoading, setMessage, loading };
        switch (role) {
            case 'Applicant':
                return <ApplicantForm {...formProps} />;
            case 'Employer':
                return <EmployerForm {...formProps} />;
            case 'Institution':
                return <InstitutionForm {...formProps} />;
            default:
                return <ApplicantForm {...formProps} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-100">
            <Header />
            <main className="flex-grow flex items-center justify-center p-4">
                {/* Main Registration Card */}
                <div className="w-full max-w-sm p-8 sm:p-10 bg-gray-200 rounded-3xl shadow-2xl border-4 border-gray-300">
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Create Your Account</h2>
                    
                    <RoleSelector role={role} setRole={setRole} />
                    
                    {renderForm()}
                    
                    <div className="text-center pt-4">
                        <p className="text-sm text-gray-600">
                            Already have an account? <Link to="/login" className="text-blue-700 hover:text-blue-900 font-bold transition">Login Here</Link>
                        </p>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm text-center font-medium mt-4 ${message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

const App = () => <SignupPage />;

export default App;
