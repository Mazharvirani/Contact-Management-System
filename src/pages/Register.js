import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

function Register() {
    const[form, setForm] = useState({
        name:'',email:'',phone:'',password:''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };
const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try{
        await API.post('/auth/register', form);
        setSuccess('Registration successful! You can now login.');
        setTimeout(() => navigate('/login'), 2000);
    }catch(err){
        setError(err.response?.data?.message || 'Registration failed.');
    }
};
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Contact Manager</h2>
                <h3 style={styles.subtitle}>Register</h3>
                {error && <p style={styles.error}>{error}</p>}
                 {success && <p style={styles.success}>{success}</p>}
                <form onSubmit={handleRegister}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Name</label>
                        <input style={styles.input} type="text" name="name"
                            value={form.name} onChange={handleChange}
                            placeholder="Enter your name" required />
                    </div>
                     <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input style={styles.input} type="email" name="email"
                            value={form.email} onChange={handleChange}
                            placeholder="Enter your email" required />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Phone</label>
                        <input style={styles.input} type="text" name="phone"
                            value={form.phone} onChange={handleChange}
                            placeholder="Enter your phone" required />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input style={styles.input} type="password" name="password"
                            value={form.password} onChange={handleChange}
                            placeholder="Enter your password" required />
                    </div>
                    <button style={styles.button} type="submit">Register</button>
                </form>
                <p style={styles.link}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5'
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '400px'
    },
    title: {
        textAlign: 'center',
        color: '#1890ff',
        marginBottom: '5px'
    },
    subtitle: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '20px'
    },
    error: { color: 'red', textAlign: 'center', marginBottom: '10px' },
    success: { color: 'green', textAlign: 'center', marginBottom: '10px' },
    inputGroup: { marginBottom: '15px' },
    label: {
        display: 'block',
        marginBottom: '5px',
        color: '#333',
        fontWeight: 'bold'
    },
    input: {
        width: '100%',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        fontSize: '14px',
        boxSizing: 'border-box'
    },
    button: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#1890ff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '10px'
    },
    link: { textAlign: 'center', marginTop: '15px' }
};

export default Register;
