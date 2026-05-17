import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, TextField, InputAdornment,
    Card, CardContent, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, CircularProgress, Alert,
    Chip, Pagination, AppBar, Toolbar, Avatar
} from '@mui/material';
import {
    Search, Add, Edit, Delete, Person, Phone, Email,
    ContactsOutlined, Logout, AccountCircle
} from '@mui/icons-material';
import API from '../api/axios';

function Contacts(){
    const [contacts, setContacts] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editContact, setEditContact] = useState(null);
    const [form, setForm] = useState({
        firstName: '', lastName: '', title: '',
        emails: [{ email: '', label: 'work' }],
        phones: [{ phone: '', label: 'home' }]
    });

    const [deleteDialog , setDeleteDialog] = useState(false);
    const[deletedId, setDeletedId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if(search){
            searchContacts();
        }else{
            fetchContacts();
        }
    }, [page, search]);
    
    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/contacts?page=${page - 1}&size=6`);
            setContacts(res.data.content);
            setTotalPages(res.data.totalPages);
        }catch{
            setError('Failed to Load contacts.');
        }finally{
            setLoading(false);
        }
    };
    const searchContacts = async () => {
         setLoading(true);
        try {
            const res = await API.get(`/contacts/search?query=${search}&page=${page - 1}&size=6`);
            setContacts(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch {
            setError('Search failed');
        } finally {
            setLoading(false);
        }
    };
    const handleOpenCreate=() => {
        setEditContact(null);
        setForm({
            firstName: '', lastName: '', title: '',
            emails: [{ email: '', label: 'work' }],
            phones: [{ phone: '', label: 'home' }]
        });
        setOpenDialog(true);
    };
    const handleOpenEdit=(contact) => {
        setEditContact(contact);
        setForm({
            firstName: contact.firstName,
            lastName: contact.lastName,
            title: contact.title,
            emails: contact.emails.length > 0 ? contact.emails : [{ email: '', label: 'work' }],
            phones: contact.phones.length > 0 ? contact.phones : [{ phone: '', label: 'home' }]
        });
        setOpenDialog(true);
    };
    const handleSave = async () => {
        try{
            if(editContact){
                await API.put(`/contacts/${editContact.id}`, form);
            }else{
                await API.post('/contacts', form);
            }setOpenDialog(false);
            fetchContacts();
        }catch{
            setError('Failed to save contact.');
        }
    };
    const handleDeleteConfirm = (id) => {
        setDeletedId(id);
        setDeleteDialog(true);
    };
    const handleDelete = async () => {
        try{
            await API.delete(`/contacts/${deletedId}`);
            setDeleteDialog(false);
            fetchContacts();
        }catch{
            setError('Failed to delete contact.');
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

  const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

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
                        startIcon={<AccountCircle />}
                        onClick={() => navigate('/profile')}
                        sx={{ color: '#1a1a2e', textTransform: 'none', mr: 1 }}
                    >
                        Profile
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

            <Box sx={{ maxWidth: 1100, margin: '0 auto', padding: '30px 20px' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">
                            Contacts
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {contacts.length} contacts
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleOpenCreate}
                        sx={{
                            backgroundColor: '#1a1a2e',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            '&:hover': { backgroundColor: '#2d2d44' }
                        }}
                    >
                        New contact
                    </Button>
                </Box>

                {/* Search */}
                <TextField
                    fullWidth
                    placeholder="Search by first or last name..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: '#aaa' }} />
                            </InputAdornment>
                        )
                    }}
                    sx={{
                        mb: 3,
                        backgroundColor: 'white',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                    }}
                />

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* Contacts List */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : contacts.length === 0 ? (
                    <Card sx={{ borderRadius: 3, textAlign: 'center', padding: '60px 20px' }}>
                        <Person sx={{ fontSize: 60, color: '#ddd', mb: 2 }} />
                        <Typography color="text.secondary">
                            No contacts yet. Create your first one.
                        </Typography>
                    </Card>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 2 }}>
                        {contacts.map((contact) => (
                            <Card key={contact.id} sx={{
                                borderRadius: 3,
                                border: '1px solid #e9ecef',
                                boxShadow: 'none',
                                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
                                transition: 'box-shadow 0.2s'
                            }}>
                                <CardContent sx={{ padding: '20px' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ backgroundColor: '#1a1a2e', width: 45, height: 45, fontWeight: 'bold' }}>
                                                {getInitials(contact.firstName, contact.lastName)}
                                            </Avatar>
                                            <Box>
                                                <Typography fontWeight="bold" color="#1a1a2e">
                                                    {contact.firstName} {contact.lastName}
                                                </Typography>
                                                {contact.title && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {contact.title}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                        <Box>
                                            <IconButton size="small" onClick={() => handleOpenEdit(contact)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDeleteConfirm(contact.id)} sx={{ color: '#dc3545' }}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    <Box sx={{ mt: 2 }}>
                                        {contact.emails?.slice(0, 1).map((e, i) => (
                                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Email sx={{ fontSize: 14, color: '#aaa' }} />
                                                <Typography variant="body2" color="text.secondary">{e.email}</Typography>
                                                <Chip label={e.label} size="small" sx={{ fontSize: 10, height: 18 }} />
                                            </Box>
                                        ))}
                                        {contact.phones?.slice(0, 1).map((p, i) => (
                                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Phone sx={{ fontSize: 14, color: '#aaa' }} />
                                                <Typography variant="body2" color="text.secondary">{p.phone}</Typography>
                                                <Chip label={p.label} size="small" sx={{ fontSize: 10, height: 18 }} />
                                            </Box>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(e, val) => setPage(val)}
                            color="primary"
                        />
                    </Box>
                )}
            </Box>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight="bold">
                    {editContact ? 'Update Contact' : 'New Contact'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <TextField
                            fullWidth label="First Name" size="small"
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        />
                        <TextField
                            fullWidth label="Last Name" size="small"
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        />
                    </Box>
                    <TextField
                        fullWidth label="Title" size="small" sx={{ mt: 2 }}
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                    <Typography variant="body2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>Email</Typography>
                    {form.emails.map((e, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <TextField
                                fullWidth label="Email" size="small"
                                value={e.email}
                                onChange={(ev) => {
                                    const updated = [...form.emails];
                                    updated[i].email = ev.target.value;
                                    setForm({ ...form, emails: updated });
                                }}
                            />
                            <TextField
                                label="Label" size="small" sx={{ width: 120 }}
                                value={e.label}
                                onChange={(ev) => {
                                    const updated = [...form.emails];
                                    updated[i].label = ev.target.value;
                                    setForm({ ...form, emails: updated });
                                }}
                            />
                        </Box>
                    ))}
                    <Button size="small" onClick={() => setForm({ ...form, emails: [...form.emails, { email: '', label: 'work' }] })}>
                        + Add Email
                    </Button>

                    <Typography variant="body2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>Phone</Typography>
                    {form.phones.map((p, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <TextField
                                fullWidth label="Phone" size="small"
                                value={p.phone}
                                onChange={(ev) => {
                                    const updated = [...form.phones];
                                    updated[i].phone = ev.target.value;
                                    setForm({ ...form, phones: updated });
                                }}
                            />
                            <TextField
                                label="Label" size="small" sx={{ width: 120 }}
                                value={p.label}
                                onChange={(ev) => {
                                    const updated = [...form.phones];
                                    updated[i].label = ev.target.value;
                                    setForm({ ...form, phones: updated });
                                }}
                            />
                        </Box>
                    ))}
                    <Button size="small" onClick={() => setForm({ ...form, phones: [...form.phones, { phone: '', label: 'home' }] })}>
                        + Add Phone
                    </Button>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px' }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: 'none', color: '#666' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained" onClick={handleSave}
                        sx={{
                            backgroundColor: '#1a1a2e', textTransform: 'none', fontWeight: 'bold',
                            '&:hover': { backgroundColor: '#2d2d44' }
                        }}
                    >
                        {editContact ? 'Save' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold">Delete Contact</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this contact? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px' }}>
                    <Button onClick={() => setDeleteDialog(false)} sx={{ textTransform: 'none', color: '#666' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained" onClick={handleDelete}
                        sx={{ backgroundColor: '#dc3545', textTransform: 'none', fontWeight: 'bold', '&:hover': { backgroundColor: '#c82333' } }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Contacts;