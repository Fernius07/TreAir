import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import './Recruitment.css';

const Recruitment = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        // Supabase or Local Fallback
        const { data } = await supabase.from('job_openings').select('*');
        if (data && data.length > 0) {
            setJobs(data);
        } else {
            const local = JSON.parse(localStorage.getItem('tre_air_jobs') || '[]');
            setJobs(local);
        }
    };

    const handleApply = (job) => {
        setSelectedJob(job);
        setAnswers({});
    };

    const submitApplication = async (e) => {
        e.preventDefault();
        const appData = {
            job_id: selectedJob.id,
            applicant_name: "RoleplayUser_" + Math.floor(Math.random() * 100), // Simulating logged user
            answers: answers,
            status: 'Pending',
            submitted_at: new Date().toISOString()
        };

        // In real app: save to DB
        // await supabase.from('applications').insert(appData);

        alert("Application Submitted! Good luck.");
        setSelectedJob(null);
    };

    return (
        <div className="page-container container">
            <h1 className="page-title fade-in visible">Join Our Crew</h1>
            <p className="recruitment-intro fade-in visible">
                Tre Air is looking for dedicated individuals. Apply below!
            </p>

            {jobs.length === 0 ? (
                <div style={{ textAlign: 'center' }}>No positions currently available.</div>
            ) : (
                <div className="jobs-grid fade-in visible">
                    {jobs.map((job, index) => (
                        <div key={index} className="glass-card job-card">
                            <h3 className="job-title">{job.title}</h3>
                            <p className="job-desc">{job.description}</p>
                            <button className="btn job-apply-btn" onClick={() => handleApply(job)}>Apply Now</button>
                        </div>
                    ))}
                </div>
            )}

            {selectedJob && (
                <Modal isOpen={true} onClose={() => setSelectedJob(null)} title={`Applying for ${selectedJob.title}`}>
                    <form className="modal-form" onSubmit={submitApplication}>
                        {selectedJob.questions.map((q, idx) => (
                            <div key={idx} className="form-group">
                                <label>{q.text}</label>
                                {q.type === 'short' && (
                                    <input type="text" required onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} />
                                )}
                                {q.type === 'long' && (
                                    <textarea required rows="4" onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} />
                                )}
                                {q.type === 'multiple' && (
                                    <select required onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}>
                                        <option value="">Select an option</option>
                                        {q.options.split(',').map(opt => (
                                            <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        ))}
                        <div className="modal-actions">
                            <button type="button" className="btn-text" onClick={() => setSelectedJob(null)}>Cancel</button>
                            <button type="submit" className="btn">Submit Application</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default Recruitment;
