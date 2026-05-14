import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await API.post('/auth/login', { identifier, password });
            localStorage.setItem('token', response.data.token);
            navigate('/contacts');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        }   
    };

    return (
        < div style={styles.container} >
            <div style ={styles.card}>
             <h2 style={styles.title}>Contact Manager</h2>
             <h3 style={styles.subtitle}>Login</h3>
             {error && <p style={styles.error}>{error}</p>}
              <form onSubmit={handleLogin}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email or Phone</label>
                        <input
                            style={styles.input}
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="Enter email or phone"
                            required
                        />
                    </div>
                     <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            style={styles.input}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>
                     <button style={styles.button} type="submit">Login</button>
                </form>
                <p style={styles.link}>
                    Don't have an account? <Link to="/register">Register</Link>
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
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: '10px'
    },
    inputGroup: {
        marginBottom: '15px'
    },
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
    link: {
        textAlign: 'center',
        marginTop: '15px'
    }
};

export default Login;