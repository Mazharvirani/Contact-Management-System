import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, Card, CardContent, TextField, Button, Typography,
    InputAdornment, IconButton, Alert, CircularProgress, Divider
} from '@mui/material';
    import { Visibility, VisibilityOff, ContactsOutlined } from '@mui/icons-material';
import API from '../api/axios';

function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
        const response = await API.post('/auth/login', { identifier, password });
        const token = response.data;

        // Check if response is a valid JWT token
        if (!token || token === 'invalid credentials' || !token.includes('.')) {
            setError('Invalid credentials. Please try again.');
            setLoading(false);
            return;
        }

        localStorage.setItem('token', token);
        navigate('/contacts');
    } catch (err) {
        setError('Invalid credentials. Please try again.');
    } finally {
        setLoading(false);
    }
};

    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2
        }}>
            {/* Logo */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 3
            }}>
                <ContactsOutlined sx={{ fontSize: 40, color: '#1a1a2e' }} />
                <Typography variant="h5" fontWeight="bold" color="#1a1a2e">
                    Contact Manager
                </Typography>
            </Box>

            <Card sx={{
                width: '100%',
                maxWidth: 500,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e9ecef'
            }}>
                <CardContent sx={{ padding: '32px' }}>
                    <Typography variant="h5" fontWeight="bold" color="#1a1a2e" mb={0.5}>
                        Sign in
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        Welcome back to Contact Manager
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleLogin}>
                        <Typography variant="body2" fontWeight="600" color="#1a1a2e" mb={0.5}>
                            Email
                        </Typography>
                        <TextField
                            fullWidth
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="Enter your email or phone"
                            required
                            size="small"
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: '#fff'
                                }
                            }}
                        />

                        <Typography variant="body2" fontWeight="600" color="#1a1a2e" mb={0.5}>
                            Password
                        </Typography>
                        <TextField
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            size="small"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            aria-label="visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: '#fff'
                                }
                            }}
                        />

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1.2,
                                borderRadius: 2,
                                backgroundColor: '#1a1a2e',
                                fontSize: '15px',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#2d2d44' }
                            }}
                        >
                            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
                        </Button>
                    </form>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body2" color="text.secondary"sx={{ textAlign: 'center' }}>
                        No account?{' '}
                        <Link to="/register" style={{ color: '#1a1a2e', fontWeight: 'bold', textDecoration: 'none' }}>
                            Register
                        </Link>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Login;