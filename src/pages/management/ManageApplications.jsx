import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Modal from '../../components/Modal';
import './Management.css';

const ManageApplications = () => {
    const [subTab, setSubTab] = useState('review');
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [editingJobId, setEditingJobId] = useState(null);

    // Form Builder State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newJob, setNewJob] = useState({ title: '', description: '', questions: [] });
    const [newQuestion, setNewQuestion] = useState({
        text: '',
        type: 'short',
        options: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        // Fetch jobs first
        const { data: jobsData } = await supabase.from('job_openings').select('*').order('id', { ascending: false });
        setJobs(jobsData || []);

        // Fetch applications. Try with join, if it fails, fetch without join.
        let { data: appsData, error } = await supabase.from('applications').select('*, job_openings(title)').order('submitted_at', { ascending: false });

        if (error) {
            console.warn("Join failed, fetching applications without join...");
            const { data: simpleApps } = await supabase.from('applications').select('*').order('submitted_at', { ascending: false });
            appsData = simpleApps;
        }

        setApplications(appsData || []);
        setLoading(false);
    };

    const addQuestion = () => {
        if (!newQuestion.text) return;
        const q = { ...newQuestion, id: Date.now() };
        setNewJob({ ...newJob, questions: [...newJob.questions, q] });
        setNewQuestion({ text: '', type: 'short', options: '' });
    };

    const removeQuestion = (id) => {
        setNewJob({ ...newJob, questions: newJob.questions.filter(q => q.id !== id) });
    };

    const saveJob = async () => {
        if (!newJob.title) return;

        const jobData = {
            ...newJob,
            id: editingJobId || Date.now()
        };

        const { error } = await supabase.from('job_openings').upsert(jobData);

        if (error) {
            console.error("Error saving job:", error.message);
            alert("Error saving job: " + error.message);
            return;
        }

        alert(editingJobId ? "Job Opening Updated!" : "Job Opening Published!");
        setIsModalOpen(false);
        setEditingJobId(null);
        setNewJob({ title: '', description: '', questions: [] });
        fetchData();
    };

    const openEditJob = (job) => {
        setEditingJobId(job.id);
        setNewJob({ ...job });
        setIsModalOpen(true);
    };

    const handleStatusUpdate = async (id, newStatus) => {
        const { error } = await supabase.from('applications').update({ status: newStatus }).eq('id', id);
        if (!error) {
            fetchData();
            setSelectedApplication(null);
        }
    };

    const deleteJob = async (id) => {
        if (window.confirm("Delete this job opening? This will also hide associated applications.")) {
            const { error } = await supabase.from('job_openings').delete().eq('id', id);
            if (!error) fetchData();
        }
    };

    return (
        <div className="page-container container">
            <div className="management-header">
                <div>
                    <h1 className="page-title">Applications</h1>
                    <div className="tab-buttons">
                        <button className={`btn-tab ${subTab === 'review' ? 'active' : ''}`} onClick={() => setSubTab('review')}>Review Submissions</button>
                        <button className={`btn-tab ${subTab === 'create' ? 'active' : ''}`} onClick={() => setSubTab('create')}>Manage Job Openings</button>
                    </div>
                </div>
                <Link to="/management" className="btn-back">Back</Link>
            </div>

            {subTab === 'create' && (
                <div className="fade-in visible">
                    <div className="glass-card" style={{ marginBottom: '2rem', flexDirection: 'row', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Current Openings</h3>
                        <button className="btn" onClick={() => { setEditingJobId(null); setNewJob({ title: '', description: '', questions: [] }); setIsModalOpen(true); }}>Create New Opening</button>
                    </div>

                    <table className="management-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Questions</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(job => (
                                <tr key={job.id}>
                                    <td>{job.title}</td>
                                    <td>{job.questions?.length || 0} questions</td>
                                    <td>
                                        <button className="btn-icon" onClick={() => openEditJob(job)}>✏️</button>
                                        <button className="btn-icon delete" onClick={() => deleteJob(job.id)}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {jobs.length === 0 && <p style={{ textAlign: 'center', marginTop: '1rem' }}>No openings found.</p>}
                </div>
            )}

            {subTab === 'review' && (
                <div className="fade-in visible">
                    <div className="glass-card">
                        <h3>Pending Reviews</h3>
                        <table className="management-table">
                            <thead>
                                <tr>
                                    <th>Applicant</th>
                                    <th>Position</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map(app => {
                                    const jobTitle = app.job_openings?.title || jobs.find(j => j.id === app.job_id)?.title || 'Unknown Position';
                                    return (
                                        <tr key={app.id}>
                                            <td>{app.applicant_name}</td>
                                            <td>{jobTitle}</td>
                                            <td>{new Date(app.submitted_at).toLocaleDateString()}</td>
                                            <td><span className={`status-badge status-${app.status.toLowerCase()}`}>{app.status}</span></td>
                                            <td>
                                                <button className="btn" onClick={() => setSelectedApplication(app)}>View</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {applications.length === 0 && <p style={{ marginTop: '1rem', textAlign: 'center' }}>No applications found.</p>}
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingJobId ? "Edit Job Opening" : "Create Job Opening"}>
                <div className="modal-form">
                    <div className="form-group">
                        <label>Job Title</label>
                        <input type="text" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} placeholder="e.g. Senior Pilot" />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} rows="3" />
                    </div>

                    <div className="form-divider">Questions Builder</div>

                    <div className="questions-list">
                        {newJob.questions.map((q, idx) => (
                            <div key={q.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>{idx + 1}. {q.text}</strong> <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({q.type})</span>
                                </div>
                                <button className="btn-icon delete" onClick={() => removeQuestion(q.id)} style={{ fontSize: '0.8rem' }}>✕</button>
                            </div>
                        ))}
                    </div>

                    <div className="add-question-box glass-card" style={{ padding: '1rem', marginTop: '1rem' }}>
                        <input type="text" placeholder="Question Text" value={newQuestion.text} onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })} style={{ width: '100%', marginBottom: '0.5rem' }} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select value={newQuestion.type} onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value })} style={{ flex: 1 }}>
                                <option value="short">Short Answer</option>
                                <option value="long">Long Answer</option>
                                <option value="multiple">Multiple Choice</option>
                            </select>
                            {newQuestion.type === 'multiple' && (
                                <input type="text" placeholder="Options (comma sep)" value={newQuestion.options} onChange={e => setNewQuestion({ ...newQuestion, options: e.target.value })} style={{ flex: 1 }} />
                            )}
                            <button onClick={addQuestion} className="btn-icon" style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '4px', width: '40px' }}>+</button>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button className="btn" onClick={saveJob}>{editingJobId ? "Save Changes" : "Publish Opening"}</button>
                    </div>
                </div>
            </Modal>

            {selectedApplication && (
                <Modal isOpen={true} onClose={() => setSelectedApplication(null)} title={`Review: ${selectedApplication.applicant_name}`}>
                    <div className="application-review-content">
                        <h4>Applying for: {selectedApplication.job_openings?.title || jobs.find(j => j.id === selectedApplication.job_id)?.title || 'Unknown Position'}</h4>
                        <div className="answers-review" style={{ marginTop: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                            {/* We need to find the job to get the question texts if we want to show them */}
                            {(() => {
                                const job = jobs.find(j => j.id === selectedApplication.job_id);
                                return Object.entries(selectedApplication.answers).map(([qId, answer]) => {
                                    const questionText = job?.questions.find(q => q.id.toString() === qId || q.id === qId)?.text || "Question " + qId;
                                    return (
                                        <div key={qId} style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                            <p style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-primary)' }}>{questionText}</p>
                                            <p style={{ color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap' }}>{answer}</p>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                        <div className="modal-actions" style={{ marginTop: '2rem' }}>
                            <button className="btn" style={{ background: '#4CAF50' }} onClick={() => handleStatusUpdate(selectedApplication.id, 'Accepted')}>Accept</button>
                            <button className="btn" style={{ background: '#f44336' }} onClick={() => handleStatusUpdate(selectedApplication.id, 'Rejected')}>Reject</button>
                            <button className="btn-text" onClick={() => setSelectedApplication(null)}>Close</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ManageApplications;
