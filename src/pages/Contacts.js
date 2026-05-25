import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, TextField, InputAdornment,
    Dialog, DialogTitle, DialogContent, DialogActions,
    CircularProgress, Alert, Pagination, AppBar, Toolbar,
    Avatar, IconButton, Chip, Divider, List, ListItem,
    ListItemAvatar, ListItemText
} from '@mui/material';
import {
    Search, Add, Edit, Delete, Phone, Email,
    ContactsOutlined, Logout, AccountCircle, Close,
    PersonOutlined
} from '@mui/icons-material';
import API from '../api/axios';

const COLORS = [
    '#1a1a2e', '#16213e', '#0f3460', '#533483',
    '#2b2d42', '#1b4332', '#774936', '#3d405b'
];

const getColor = (name) => COLORS[name?.charCodeAt(0) % COLORS.length] || '#1a1a2e';

const getInitials = (firstName, lastName) =>
    `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

function Contacts() {
    const [contacts, setContacts] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);

    const [openDialog, setOpenDialog] = useState(false);
    const [editContact, setEditContact] = useState(null);
    const [form, setForm] = useState({
        firstName: '', lastName: '', title: '',
        emails: [{ email: '', label: 'work' }],
        phones: [{ phone: '', label: 'home' }]
    });

    const [deleteDialog, setDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (search) searchContacts();
        else fetchContacts();
    }, [page, search]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/contacts?page=${page - 1}&size=10`);
            setContacts(res.data.content);
            setTotalPages(res.data.totalPages);
            setTotal(res.data.totalElements);
        } catch { setError('Failed to load contacts'); }
        finally { setLoading(false); }
    };

    const searchContacts = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/contacts/search?query=${search}&page=${page - 1}&size=10`);
            setContacts(res.data.content);
            setTotalPages(res.data.totalPages);
            setTotal(res.data.totalElements);
        } catch { setError('Search failed'); }
        finally { setLoading(false); }
    };

    const handleOpenCreate = () => {
        setEditContact(null);
        setForm({ firstName: '', lastName: '', title: '', emails: [{ email: '', label: 'work' }], phones: [{ phone: '', label: 'home' }] });
        setOpenDialog(true);
    };

    const handleOpenEdit = (contact) => {
        setEditContact(contact);
        setForm({
            firstName: contact.firstName, lastName: contact.lastName, title: contact.title,
            emails: contact.emails?.length > 0 ? contact.emails : [{ email: '', label: 'work' }],
            phones: contact.phones?.length > 0 ? contact.phones : [{ phone: '', label: 'home' }]
        });
        setOpenDialog(true);
    };

    const handleSave = async () => {
        try {
            if (editContact) await API.put(`/contacts/${editContact.id}`, form);
            else await API.post('/contacts', form);
            setOpenDialog(false);
            fetchContacts();
            setSelected(null);
        } catch { setError('Failed to save contact'); }
    };

    const handleDelete = async () => {
        try {
            await API.delete(`/contacts/${deleteId}`);
            setDeleteDialog(false);
            setSelected(null);
            fetchContacts();
        } catch { setError('Failed to delete contact'); }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const grouped = contacts.reduce((acc, contact) => {
        const letter = contact.firstName?.charAt(0).toUpperCase() || '#';
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(contact);
        return acc;
    }, {});

    const handleExport = async () => {
        try {
            const res = await API.get('/contacts/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'contacts.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            setError('Export failed');
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            await API.post('/contacts/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchContacts();
        } catch {
            setError('Import failed');
        }
    };


    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <AppBar position="static" elevation={0} sx={{
                backgroundColor: 'white',
                borderBottom: '1px solid #e9ecef',
                color: '#1a1a2e'
            }}>
                <Toolbar>
                    <ContactsOutlined sx={{ mr: 1.5, color: '#1a1a2e', fontSize: 28 }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1, color: '#1a1a2e' }}>
                        Contact Manager
                    </Typography>
                    <Button startIcon={<AccountCircle />} onClick={() => navigate('/profile')}
                        sx={{ color: '#555', textTransform: 'none', mr: 1, fontWeight: '500' }}>
                        Profile
                    </Button>
                    <Button startIcon={<Logout />} onClick={handleLogout}
                        sx={{ color: '#555', textTransform: 'none', fontWeight: '500' }}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Box sx={{ display: 'flex', flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '24px 20px', gap: 3 }}>

                {/* LEFT PANEL — Contact List */}
                <Box sx={{ width: selected ? 380 : '100%', maxWidth: selected ? 380 : '100%', transition: 'all 0.3s', flexShrink: 0 }}>

                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Contacts</Typography>
                            <Typography variant="body2" color="text.secondary">{total} contacts</Typography>
                        </Box>
                         <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            onClick={handleExport}
                            sx={{
                                borderRadius: 2, textTransform: 'none',
                                borderColor: '#1a1a2e', color: '#1a1a2e',
                                fontWeight: 'bold',
                                '&:hover': { backgroundColor: '#f0f0f5' }
                            }}>
                            Export CSV
                        </Button>
                        <Button
                            variant="outlined"
                            component="label"
                            sx={{
                                borderRadius: 2, textTransform: 'none',
                                borderColor: '#1a1a2e', color: '#1a1a2e',
                                fontWeight: 'bold',
                                '&:hover': { backgroundColor: '#f0f0f5' }
                            }}>
                            Import CSV
                            <input type="file" accept=".csv" hidden onChange={handleImport} />
                        </Button>
                        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}
                            sx={{
                                backgroundColor: '#1a1a2e', borderRadius: 2,
                                textTransform: 'none', fontWeight: 'bold', px: 2.5,
                                '&:hover': { backgroundColor: '#2d2d44' }
                            }}>
                            New contact
                        </Button>
                    </Box>
                    </Box>
                   


                    {/* Search */}
                    <TextField fullWidth placeholder="Search by first or last name..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); setSelected(null); }}
                        size="small"
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Search sx={{ color: '#aaa' }} /></InputAdornment>
                        }}
                        sx={{ mb: 5,mt: 2, backgroundColor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {/* Contact List */}
                    <Box sx={{
                        backgroundColor: 'white', borderRadius: 3,
                        border: '1px solid #e9ecef', overflow: 'hidden'
                    }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                                <CircularProgress />
                            </Box>
                        ) : contacts.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <PersonOutlined sx={{ fontSize: 64, color: '#ddd', mb: 2 }} />
                                <Typography color="text.secondary" fontWeight="500">No contacts yet</Typography>
                                <Typography variant="body2" color="text.secondary">Create your first contact</Typography>
                            </Box>
                        ) : (
                            Object.keys(grouped).sort().map((letter) => (
                                <Box key={letter}>
                                    {/* Letter Header */}
                                    <Box sx={{
                                        px: 2, py: 0.8,
                                        backgroundColor: '#f8f9fa',
                                        borderBottom: '1px solid #e9ecef',
                                        borderTop: '1px solid #e9ecef'
                                    }}>
                                        <Typography variant="caption" fontWeight="bold" color="#888" sx={{ letterSpacing: 1 }}>
                                            {letter}
                                        </Typography>
                                    </Box>

                                    <List disablePadding>
                                        {grouped[letter].map((contact, idx) => (
                                            <React.Fragment key={contact.id}>
                                                <ListItem
                                                    button
                                                    onClick={() => setSelected(contact)}
                                                    sx={{
                                                        px: 2, py: 1.2,
                                                        backgroundColor: selected?.id === contact.id ? '#f0f4ff' : 'white',
                                                        borderLeft: selected?.id === contact.id ? '3px solid #1a1a2e' : '3px solid transparent',
                                                        '&:hover': { backgroundColor: '#f5f5f5' },
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar sx={{
                                                            backgroundColor: getColor(contact.firstName),
                                                            width: 42, height: 42,
                                                            fontSize: 16, fontWeight: 'bold'
                                                        }}>
                                                            {getInitials(contact.firstName, contact.lastName)}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <Typography fontWeight="500" color="#1a1a2e">
                                                                {contact.firstName} {contact.lastName}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                                {contact.title || contact.phones?.[0]?.phone || contact.emails?.[0]?.email || ''}
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItem>
                                                {idx < grouped[letter].length - 1 && <Divider sx={{ ml: 8 }} />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </Box>
                            ))
                        )}
                    </Box>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} />
                        </Box>
                    )}
                </Box>

                {/* RIGHT PANEL — Contact Detail */}
                {selected && (
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{
                            backgroundColor: 'white', borderRadius: 3,
                            border: '1px solid #e9ecef', overflow: 'hidden'
                        }}>
                            {/* Contact Header */}
                            <Box sx={{
                                background: `linear-gradient(135deg, ${getColor(selected.firstName)} 0%, #2d2d44 100%)`,
                                padding: '40px 30px',
                                color: 'white',
                                position: 'relative'
                            }}>
                                <IconButton onClick={() => setSelected(null)}
                                    sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.7)' }}>
                                    <Close />
                                </IconButton>
                                <Avatar sx={{
                                    width: 80, height: 80, fontSize: 32, fontWeight: 'bold',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    border: '3px solid rgba(255,255,255,0.4)',
                                    mb: 2
                                }}>
                                    {getInitials(selected.firstName, selected.lastName)}
                                </Avatar>
                                <Typography variant="h5" fontWeight="bold">
                                    {selected.firstName} {selected.lastName}
                                </Typography>
                                {selected.title && (
                                    <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                                        {selected.title}
                                    </Typography>
                                )}

                                {/* Action Buttons */}
                                <Box sx={{ display: 'flex', gap: 1, mt: 2.5 }}>
                                    <Button variant="contained" startIcon={<Edit />}
                                        onClick={() => handleOpenEdit(selected)}
                                        size="small"
                                        sx={{
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            textTransform: 'none', borderRadius: 2,
                                            backdropFilter: 'blur(10px)',
                                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                                        }}>
                                        Edit
                                    </Button>
                                    <Button variant="contained" startIcon={<Delete />}
                                        onClick={() => { setDeleteId(selected.id); setDeleteDialog(true); }}
                                        size="small"
                                        sx={{
                                            backgroundColor: 'rgba(220,53,69,0.7)',
                                            textTransform: 'none', borderRadius: 2,
                                            '&:hover': { backgroundColor: 'rgba(220,53,69,0.9)' }
                                        }}>
                                        Delete
                                    </Button>
                                </Box>
                            </Box>

                            {/* Contact Details */}
                            <Box sx={{ padding: '24px 30px' }}>

                                {/* Phone Numbers */}
                                {selected.phones?.length > 0 && (
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="caption" fontWeight="bold" color="#888"
                                            sx={{ letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
                                            Phone Numbers
                                        </Typography>
                                        {selected.phones.map((p, i) => (
                                            <Box key={i} sx={{
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'space-between',
                                                py: 1.5, borderBottom: i < selected.phones.length - 1 ? '1px solid #f0f0f0' : 'none'
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box sx={{
                                                        width: 36, height: 36, borderRadius: '50%',
                                                        backgroundColor: '#f0f4ff',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <Phone sx={{ fontSize: 18, color: '#1a1a2e' }} />
                                                    </Box>
                                                    <Typography fontWeight="500">{p.phone}</Typography>
                                                </Box>
                                                <Chip label={p.label} size="small"
                                                    sx={{ backgroundColor: '#f0f4ff', color: '#1a1a2e', fontWeight: '500' }} />
                                            </Box>
                                        ))}
                                    </Box>
                                )}

                                {/* Email Addresses */}
                                {selected.emails?.length > 0 && (
                                    <Box>
                                        <Typography variant="caption" fontWeight="bold" color="#888"
                                            sx={{ letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
                                            Email Addresses
                                        </Typography>
                                        {selected.emails.map((e, i) => (
                                            <Box key={i} sx={{
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'space-between',
                                                py: 1.5, borderBottom: i < selected.emails.length - 1 ? '1px solid #f0f0f0' : 'none'
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box sx={{
                                                        width: 36, height: 36, borderRadius: '50%',
                                                        backgroundColor: '#f0f4ff',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <Email sx={{ fontSize: 18, color: '#1a1a2e' }} />
                                                    </Box>
                                                    <Typography fontWeight="500">{e.email}</Typography>
                                                </Box>
                                                <Chip label={e.label} size="small"
                                                    sx={{ backgroundColor: '#f0f4ff', color: '#1a1a2e', fontWeight: '500' }} />
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight="bold" sx={{ pb: 1 }}>
                    {editContact ? 'Edit Contact' : 'New Contact'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <TextField fullWidth label="First Name" size="small"
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                        <TextField fullWidth label="Last Name" size="small"
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                    </Box>
                    <TextField fullWidth label="Title" size="small" sx={{ mt: 2 }}
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })} />

                    <Typography variant="body2" fontWeight="bold" sx={{ mt: 2.5, mb: 1, color: '#555' }}>
                        📞 Phone Numbers
                    </Typography>
                    {form.phones.map((p, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <TextField fullWidth label="Phone" size="small" value={p.phone}
                                onChange={(ev) => {
                                    const updated = [...form.phones];
                                    updated[i].phone = ev.target.value;
                                    setForm({ ...form, phones: updated });
                                }} />
                            <TextField label="Label" size="small" sx={{ width: 110 }} value={p.label}
                                onChange={(ev) => {
                                    const updated = [...form.phones];
                                    updated[i].label = ev.target.value;
                                    setForm({ ...form, phones: updated });
                                }} />
                            {form.phones.length > 1 && (
                                <IconButton size="small" onClick={() => setForm({ ...form, phones: form.phones.filter((_, j) => j !== i) })}>
                                    <Close fontSize="small" />
                                </IconButton>
                            )}
                        </Box>
                    ))}
                    <Button size="small" onClick={() => setForm({ ...form, phones: [...form.phones, { phone: '', label: 'home' }] })}
                        sx={{ textTransform: 'none', color: '#1a1a2e', mb: 1 }}>
                        + Add Phone
                    </Button>

                    <Typography variant="body2" fontWeight="bold" sx={{ mt: 1.5, mb: 1, color: '#555' }}>
                        ✉️ Email Addresses
                    </Typography>
                    {form.emails.map((e, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <TextField fullWidth label="Email" size="small" value={e.email}
                                onChange={(ev) => {
                                    const updated = [...form.emails];
                                    updated[i].email = ev.target.value;
                                    setForm({ ...form, emails: updated });
                                }} />
                            <TextField label="Label" size="small" sx={{ width: 110 }} value={e.label}
                                onChange={(ev) => {
                                    const updated = [...form.emails];
                                    updated[i].label = ev.target.value;
                                    setForm({ ...form, emails: updated });
                                }} />
                            {form.emails.length > 1 && (
                                <IconButton size="small" onClick={() => setForm({ ...form, emails: form.emails.filter((_, j) => j !== i) })}>
                                    <Close fontSize="small" />
                                </IconButton>
                            )}
                        </Box>
                    ))}
                    <Button size="small" onClick={() => setForm({ ...form, emails: [...form.emails, { email: '', label: 'work' }] })}
                        sx={{ textTransform: 'none', color: '#1a1a2e' }}>
                        + Add Email
                    </Button>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px' }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: 'none', color: '#666' }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSave}
                        sx={{ backgroundColor: '#1a1a2e', textTransform: 'none', fontWeight: 'bold', borderRadius: 2, px: 3, '&:hover': { backgroundColor: '#2d2d44' } }}>
                        {editContact ? 'Save Changes' : 'Create Contact'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold">Delete Contact</DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">
                        Are you sure you want to delete this contact? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px' }}>
                    <Button onClick={() => setDeleteDialog(false)} sx={{ textTransform: 'none', color: '#666' }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleDelete}
                        sx={{ backgroundColor: '#dc3545', textTransform: 'none', fontWeight: 'bold', '&:hover': { backgroundColor: '#c82333' } }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Contacts;