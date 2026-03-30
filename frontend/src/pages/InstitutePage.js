import React, { useState } from 'react';
import { UserCircle, Bell, Plus, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const initialCertData = [
  {
    id: 'c001',
    name: 'Java Certificate',
    status: 'Uploaded',
    uploadedDate: '19/09/2025',
    count: 105,
  },
  {
    id: 'c002',
    name: 'Power BI Certificate',
    status: 'Pending',
    uploadedDate: '02/10/2025',
    count: 225,
  },
  {
    id: 'c003',
    name: 'NPTEL',
    status: 'Uploaded',
    uploadedDate: '15/09/2025',
    count: 109,
  },
  {
    id: 'c004',
    name: 'Event Participation',
    status: 'Uploaded',
    uploadedDate: '20/08/2025',
    count: 222,
  },
];

const getStatusInfo = (status) => {
  switch (status) {
    case 'Uploaded':
      return { text: 'text-green-600', icon: CheckCircle, bgColor: 'bg-green-100', borderColor: 'border-green-500' };
    case 'Pending':
      return { text: 'text-yellow-700', icon: Clock, bgColor: 'bg-yellow-100', borderColor: 'border-yellow-500' };
    default:
      return { text: 'text-gray-500', icon: Clock, bgColor: 'bg-gray-100', borderColor: 'border-gray-400' };
  }
};

const App = () => {
  const [certificateData, setCertificateData] = useState(initialCertData);
  const institution = localStorage.getItem('userEmail') || 'User Name!';
  const institutionName = `${institution}`;
  const organizationName = "AI-CertiAuth";

  const handleAddNewData = () => {
    console.log("Opening interface to upload new certificate data batch...");
    alert("Interface for new certificate data upload simulated.");

    const newId = `c${Date.now()}`;
    const newEntry = {
        id: newId,
        name: 'New Certification Batch',
        status: 'Pending',
        uploadedDate: new Date().toLocaleDateString('en-GB'),
        count: Math.floor(Math.random() * 50) + 50,
    };
    setCertificateData([newEntry, ...certificateData]);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      
      <header className="flex items-center justify-between px-6 py-4 bg-blue-900 text-white shadow-xl sticky top-0 z-10">
        <h1 className="text-2xl font-extrabold tracking-wider">{organizationName}</h1>
        <nav className="flex items-center space-x-6">
          {/* <a className="text-gray-300 hover:text-white transition hidden sm:inline"><Link to={"/about"}>About</Link></a>
          <a className="text-gray-300 hover:text-white transition hidden sm:inline"><Link to={"/feature"}>Features</Link></a>
          <a className="text-gray-300 hover:text-white transition hidden sm:inline"><Link to={"/"}>Contact</Link></a> */}
          
          <div className="flex items-center space-x-4 border-l border-gray-700 pl-4">
            <Link to="/verify" className="text-gray-300 hover:text-white transition hidden sm:inline">Verify</Link>
            <span className="text-sm font-medium hidden md:inline">Profile</span>
            <UserCircle className="w-6 h-6 cursor-pointer hover:text-blue-300" />
            <Bell className="w-6 h-6 cursor-pointer hover:text-blue-300" />
          </div>
        </nav>
      </header>

      <main className="container max-w-5xl px-4 py-8 mx-auto flex-grow">
        
        <h2 className="mb-8 text-2xl font-light text-gray-700">
          Hii <span className="font-semibold text-gray-900">{institutionName}</span>
        </h2>

        <div 
          onClick={handleAddNewData} 
          className="flex items-center w-full max-w-sm p-4 mb-10 border-2 border-gray-400 border-dashed rounded-lg cursor-pointer bg-white hover:bg-blue-50 transition duration-200 shadow-inner"
        >
          <Plus className="w-8 h-8 text-gray-600 mr-3 border-2 border-gray-600 rounded-md p-0.5" />
          <span className="text-lg font-medium text-gray-700">Add new certificates data</span>
        </div>

        <h3 className="mb-5 text-xl font-bold text-gray-800 border-b pb-2">
          Your Uploaded Certificates Data :
        </h3>

        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Certificate Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Uploaded Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  No. of certificates uploaded
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {certificateData.map((cert) => {
                const { text, icon: StatusIcon, bgColor } = getStatusInfo(cert.status);

                return (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cert.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${text} ${bgColor}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {cert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cert.uploadedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                      {cert.count.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
};

export default App;