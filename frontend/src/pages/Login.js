import React, { useState } from 'react';
import { Mail, Lock, LogIn, User, Building, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const Header = () => (
    <header className="bg-blue-800 text-white shadow-lg p-4">
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
    <footer className="bg-blue-900 text-gray-300 py-4 text-center text-sm font-semibold">
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


const LoginForm = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('Institution'); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try{
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email,
                password,
                role
            });
            setMessage(response.data.message || 'Login successful');
            if(response.status === 200){
                // Save data to localStorage first so subsequent pages can read immediately
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userEmail', response.data.userEmail);
                localStorage.setItem('resumeUrl', response.data.resumeUrl || '');
                localStorage.setItem('fileName', response.data.fileName || 'Not uploaded');

                console.log('Login successful', { role, userEmail: response.data.userEmail, token: response.data.token });

                if(role === 'Applicant'){
                    console.log('Navigating to applicant dashboard');
                    navigate("/applicantPage");
                }else if(role === 'Employer'){
                    console.log('Navigating to employer dashboard');
                    navigate("/employerPage");
                }else if(role === 'Institution'){
                    console.log('Navigating to institute dashboard');
                    navigate("/institutePage");
                }
            }
        }
        catch(err){
            setMessage(err.response?.data?.message || 'Login failed. Please try again.');
        }
        finally{
            setLoading(false);
        }
    };

    return (
        <section className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-4 bg-gray-100">
            <div className="w-full max-w-sm p-8 sm:p-10 bg-gray-200 rounded-3xl shadow-2xl border-4 border-gray-300">
                
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Login</h2>

                <RoleSelector role={role} setRole={setRole} />
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email :</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-inner focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password :</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-inner focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                placeholder="********"
                                required
                            />
                        </div>
                    </div>

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
                            <><LogIn className="w-5 h-5 mr-2" /> Login</>
                        )}
                    </button>
                    
                    <div className="text-center pt-2">
                        <p className="text-sm text-gray-600">
                            not have an account? <Link to={"/signup"} className="text-blue-700 hover:text-blue-900 font-bold transition">register</Link>
                        </p>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm text-center font-medium ${message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message}
                        </div>
                    )}
                </form>

            </div>
        </section>
    );
};

const App = () => {
    return (
        <div className="min-h-screen flex flex-col font-sans">
            <Header />
            <main className="flex-grow">
                <LoginForm />
            </main>
            <Footer />
        </div>
    );
};

export default App;
