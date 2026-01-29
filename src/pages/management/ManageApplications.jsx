import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Modal from '../../components/Modal';
import './Management.css';

const ManageApplications = () => {
    // This component now manages Job Openings AND Reviews Applications
    // We'll split it into two tabs for better UX
    const [subTab, setSubTab] = useState('review'); // 'review' or 'create'
    const [jobs, setJobs] = useState([]);

    // Form Builder State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newJob, setNewJob] = useState({ title: '', description: '', questions: [] });
    const [newQuestion, setNewQuestion] = useState({
        text: '',
        type: 'short', // short, long, multiple
        options: '' // Comma separated for multiple
    });

    const addQuestion = () => {
        if (!newQuestion.text) return;
        const q = { ...newQuestion, id: Date.now() };
        setNewJob({ ...newJob, questions: [...newJob.questions, q] });
        setNewQuestion({ text: '', type: 'short', options: '' });
    };

    const saveJob = async () => {
        if (!newJob.title) return;

        const jobData = {
            ...newJob,
            id: Date.now() // Simple numeric ID for Supabase
        };

        const { error } = await supabase.from('job_openings').insert(jobData);

        if (error) {
            console.error("Error creating job:", error.message);
            alert("Error creating job: " + error.message);
            return;
        }

        alert("Job Opening Created!");
        setIsModalOpen(false);
        setNewJob({ title: '', description: '', questions: [] });
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
                        <button className="btn" onClick={() => setIsModalOpen(true)}>Create New Opening</button>
                    </div>
                    {/* List of jobs would go here */}
                </div>
            )}

            {subTab === 'review' && (
                <div className="fade-in visible">
                    <div className="glass-card">
                        <h3>Pending Reviews</h3>
                        <p>No new applications at this time.</p>
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Job Opening">
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
                            <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px' }}>
                                <strong>{idx + 1}. {q.text}</strong> <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({q.type})</span>
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
                        <button className="btn" onClick={saveJob}>Publish Opening</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ManageApplications;
