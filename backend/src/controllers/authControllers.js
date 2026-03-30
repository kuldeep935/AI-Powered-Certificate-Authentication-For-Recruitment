const bcrypt = require('bcryptjs');
const Applicant = require('../models/Applicant');
const Employer = require('../models/Employer');
const Institution = require('../models/Institution');
const jwt = require('jsonwebtoken');

exports.registerUser = async(req, res) => {
    try{
        const { email, password, role, institutionName, companyName } =  req.body;

        const existingApplicant = await Applicant.findOne({ email });
        const existingEmployer = await Employer.findOne({ email });
        const existingInstitution = await Institution.findOne({ email });

        if (existingApplicant || existingEmployer || existingInstitution) {
            return res.status(400).json({ 
                message: "Email is already registered. Please login instead." 
            });
        }

        if(!email || !password || !role){
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let newUser;

        if(role.toLowerCase() === 'applicant'){
            newUser = new Applicant({email, password: hashedPassword});
        } else if(role.toLowerCase() === 'employer'){
            newUser = new Employer({companyName, email, password: hashedPassword});
        } else if(role.toLowerCase() === 'institution'){
            newUser = new Institution({institutionName, email, password: hashedPassword});
        } else{
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        await newUser.save();

        res.status(201).json({ message: `${role} User registered successfully` });
    }
    catch(err){
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.loginUser = async(req, res) => {
    try{
        const { email, password, role} = req.body;
        
        if(!email || !password || !role){
            return  res.status(400).json({ message: 'Please provide all required fields' });
        }

        let model;
        if(role.toLowerCase() === 'applicant') model = Applicant;
        else if(role.toLowerCase() === 'employer') model = Employer;
        else if(role.toLowerCase() === 'institution') model = Institution;
        else return res.status(400).json({ message: 'Invalid role specified' });

        const user = await model.findOne({ email });
        if(!user){
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        // console.log(`User ${email} logged in as ${role}`); // Debug log
        res.status(200).json({ message: 'Login successful', token, 
            userEmail: user.email,
            resumeUrl: user.resumeUrl || null,
            fileName: user.fileName || null
        });
    }
    catch(err){
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};