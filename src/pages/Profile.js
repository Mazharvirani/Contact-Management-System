import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, TextField, Card, CardContent,
    Avatar, Dialog, DialogTitle, DialogContent, DialogActions,
    Alert, CircularProgress, AppBar, Toolbar, IconButton,
    Divider
} from '@mui/material';
import {
    ArrowBack, Logout, LockReset, ContactsOutlined,
    Person, Email, Phone
} from '@mui/icons-material';
import API from '../api/axios';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Change Password Dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        identifier: '',
        oldPassword: '',
        newPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await API.get('/user/profile');
            setProfile(res.data);
            setPasswordForm(prev => ({ ...prev, identifier: res.data.email }));
        } catch {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');
        try {
            await API.post('/user/change-password', passwordForm);
            setPasswordSuccess('Password changed successfully!');
            setTimeout(() => {
                setOpenDialog(false);
                setPasswordSuccess('');
            }, 2000);
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Failed to change password');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Navbar */}
            <AppBar position="static" sx={{
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                color: '#1a1a2e'
            }}>
                <Toolbar>
                    <ContactsOutlined sx={{ mr: 1, color: '#1a1a2e' }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
                        Contact Manager
                    </Typography>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/contacts')}
                        sx={{ color: '#1a1a2e', textTransform: 'none', mr: 1 }}
                    >
                        Contacts
                    </Button>
                    <Button
                        startIcon={<Logout />}
                        onClick={handleLogout}
                        sx={{ color: '#1a1a2e', textTransform: 'none' }}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Box sx={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                {/* Profile Card */}
                <Card sx={{
                    borderRadius: 3,
                    border: '1px solid #e9ecef',
                    boxShadow: 'none'
                }}>
                    {/* Profile Header */}
                    <Box sx={{
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)',
                        padding: '40px 30px',
                        textAlign: 'center',
                        color: 'white'
                    }}>
                        <Avatar sx={{
                            width: 80, height: 80,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            fontSize: 32, fontWeight: 'bold',
                            margin: '0 auto 16px'
                        }}>
                            {getInitials(profile?.name)}
                        </Avatar>
                        <Typography variant="h5" fontWeight="bold">
                            {profile?.name}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                            {profile?.role}
                        </Typography>
                    </Box>

                    <CardContent sx={{ padding: '30px' }}>
                        {/* Info Fields */}
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                                <Person sx={{ color: '#aaa' }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                        FULL NAME
                                    </Typography>
                                    <Typography fontWeight="500">{profile?.name}</Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 2.5 }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                                <Email sx={{ color: '#aaa' }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                        EMAIL ADDRESS
                                    </Typography>
                                    <Typography fontWeight="500">{profile?.email}</Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 2.5 }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Phone sx={{ color: '#aaa' }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                        PHONE NUMBER
                                    </Typography>
                                    <Typography fontWeight="500">{profile?.phone}</Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<LockReset />}
                                onClick={() => setOpenDialog(true)}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    borderColor: '#1a1a2e',
                                    color: '#1a1a2e',
                                    '&:hover': { borderColor: '#2d2d44', backgroundColor: '#f0f0f5' }
                                }}
                            >
                                Change Password
                            </Button>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<Logout />}
                                onClick={handleLogout}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    backgroundColor: '#dc3545',
                                    '&:hover': { backgroundColor: '#c82333' }
                                }}
                            >
                                Logout
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Change Password Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold">Change Password</DialogTitle>
                <DialogContent>
                    {passwordError && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{passwordError}</Alert>
                    )}
                    {passwordSuccess && (
                        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{passwordSuccess}</Alert>
                    )}
                    <TextField
                        fullWidth
                        label="Current Password"
                        type="password"
                        size="small"
                        sx={{ mt: 1, mb: 2 }}
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        size="small"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px' }}>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        sx={{ textTransform: 'none', color: '#666' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleChangePassword}
                        sx={{
                            backgroundColor: '#1a1a2e',
                            textTransform: 'none',
                            fontWeight: 'bold',
                            '&:hover': { backgroundColor: '#2d2d44' }
                        }}
                    >
                        Reset
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Profile;