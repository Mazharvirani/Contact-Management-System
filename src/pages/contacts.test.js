import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Contacts from './Contacts';
import API from '../api/axios';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    MemoryRouter: ({ children }) => <div>{children}</div>,
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Routes: ({ children }) => <div>{children}</div>,
    Route: ({ element }) => element,
    Navigate: () => null,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    useNavigate: () => mockNavigate,
}));

jest.mock('../api/axios', () => ({
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    put: jest.fn(),
}));

const mockContactsData = {
    content: [
        {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            title: 'Manager',
            phones: [{ phone: '03001234567', label: 'home' }],
            emails: [{ email: 'john@example.com', label: 'work' }],
        },
        {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            title: 'Designer',
            phones: [{ phone: '03117654321', label: 'work' }],
            emails: [{ email: 'jane@example.com', label: 'home' }],
        },
    ],
    totalPages: 1,
    totalElements: 2,
};

const renderContacts = () =>
    render(
        <div data-testid="router-context-fallback">
            <Contacts />
        </div>
    );

describe('Contacts Page', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        API.get.mockResolvedValue({ data: mockContactsData });
    });

    // ─── RENDER ───────────────────────────────────────────────

    test('renders structural headers and action utilities safely', async () => {
        renderContacts();
        await screen.findByRole('heading', { name: /contacts/i });
        expect(screen.getByPlaceholderText(/search by first or last name/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /new contact/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /import csv/i })).toBeInTheDocument();
    });

    test('displays loaded contact data from backend successfully', async () => {
        renderContacts();
        expect(await screen.findByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('2 contacts')).toBeInTheDocument();
    });

    test('renders navbar with profile and logout buttons', async () => {
        renderContacts();
        await screen.findByText('John Doe');
        expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    // ─── EMPTY STATE ──────────────────────────────────────────

    test('renders empty state when no contacts exist', async () => {
        API.get.mockResolvedValueOnce({
            data: { content: [], totalPages: 0, totalElements: 0 },
        });
        renderContacts();
        expect(await screen.findByText(/no contacts yet/i)).toBeInTheDocument();
        expect(screen.getByText(/create your first contact/i)).toBeInTheDocument();
    });

    // ─── ERROR STATE ──────────────────────────────────────────

    test('shows error alert when API call fails on load', async () => {
        API.get.mockRejectedValueOnce(new Error('Network Error'));
        renderContacts();
        expect(await screen.findByText(/failed to load contacts/i)).toBeInTheDocument();
    });

    // ─── SEARCH ───────────────────────────────────────────────

    test('triggers search requests on input variance cleanly', async () => {
        renderContacts();
        await screen.findByText('John Doe');
        API.get.mockResolvedValueOnce({
            data: { content: [mockContactsData.content[0]], totalPages: 1, totalElements: 1 },
        });
        const searchInput = screen.getByPlaceholderText(/search by first or last name/i);
        fireEvent.change(searchInput, { target: { value: 'John' } });
        await waitFor(() =>
            expect(API.get).toHaveBeenCalledWith(expect.stringContaining('query=John'))
        );
    });

    test('shows search error gracefully', async () => {
        renderContacts();
        await screen.findByText('John Doe');
        API.get.mockRejectedValueOnce(new Error('Search failed'));
        fireEvent.change(
            screen.getByPlaceholderText(/search by first or last name/i),
            { target: { value: 'xyz' } }
        );
        expect(await screen.findByText(/search failed/i)).toBeInTheDocument();
    });

    // ─── DETAIL PANEL ─────────────────────────────────────────

    test('opens contact detail panel on contact click', async () => {
        renderContacts();
        fireEvent.click(await screen.findByText('John Doe'));
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('03001234567')).toBeInTheDocument();
    });

    test('shows phone and email labels in detail panel', async () => {
        renderContacts();
        fireEvent.click(await screen.findByText('John Doe'));
        expect(screen.getByText('home')).toBeInTheDocument();
        expect(screen.getByText('work')).toBeInTheDocument();
    });

    test('closes detail panel on close button click', async () => {
        renderContacts();
        fireEvent.click(await screen.findByText('John Doe'));
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        const closeBtn = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeBtn);
        await waitFor(() =>
            expect(screen.queryByText('john@example.com')).not.toBeInTheDocument()
        );
    });

    // ─── CREATE ───────────────────────────────────────────────

    test('opens new contact dialog on button click', async () => {
        renderContacts();
        await screen.findByText('John Doe');
        fireEvent.click(screen.getByRole('button', { name: /new contact/i }));
        expect(screen.getByRole('heading', { name: /new contact/i })).toBeInTheDocument();
    });

    test('creates new contact successfully and closes dialog', async () => {
        API.post.mockResolvedValueOnce({ data: {} });
        renderContacts();
        await screen.findByText('John Doe');
        fireEvent.click(screen.getByRole('button', { name: /new contact/i }));
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Charlie' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Brown' } });
        fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'CEO' } });
        fireEvent.click(screen.getByRole('button', { name: /create contact/i }));
        await waitFor(() => expect(API.post).toHaveBeenCalledWith('/contacts', expect.objectContaining({
            firstName: 'Charlie',
            lastName: 'Brown',
        })));
    });

    test('shows error when create contact fails', async () => {
        API.post.mockRejectedValueOnce(new Error('Save failed'));
        renderContacts();
        await screen.findByText('John Doe');
        fireEvent.click(screen.getByRole('button', { name: /new contact/i }));
        fireEvent.click(screen.getByRole('button', { name: /create contact/i }));
        await waitFor(async () =>
             expect(await screen.findByText(/failed to save contact/i)).toBeInTheDocument()
        );
    });

    test('cancels create dialog without saving', async () => {
        renderContacts();
        await screen.findByText('John Doe');
        fireEvent.click(screen.getByRole('button', { name: /new contact/i }));
        expect(screen.getByRole('heading', { name: /new contact/i })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
        await waitFor(() =>
            expect(screen.queryByRole('heading', { name: /new contact/i })).not.toBeInTheDocument()
        );
    });

    test('adds extra phone field in create dialog', async () => {
        renderContacts();
        await screen.findByText('John Doe');
        fireEvent.click(screen.getByRole('button', { name: /new contact/i }));
        fireEvent.click(screen.getByRole('button', { name: /\+ add phone/i }));
        expect(screen.getAllByLabelText(/^phone$/i).length).toBeGreaterThan(1);
    });

    test('adds extra email field in create dialog', async () => {
        renderContacts();
        await screen.findByText('John Doe');
        fireEvent.click(screen.getByRole('button', { name: /new contact/i }));
        fireEvent.click(screen.getByRole('button', { name: /\+ add email/i }));
        expect(screen.getAllByLabelText(/^email$/i).length).toBeGreaterThan(1);
    });

    test('removes extra phone field in create dialog', async () => {
        renderContacts();
        await screen.findByText('John Doe');
        fireEvent.click(screen.getByRole('button', { name: /new contact/i }));
        fireEvent.click(screen.getByRole('button', { name: /\+ add phone/i }));
        const closeButtons = screen.getAllByRole('button').filter(btn => 
            btn.innerHTML.includes('svg') || btn.className.includes('close') || btn.className.includes('delete')
        );
        const allButtons = screen.getAllByRole('button');
        fireEvent.click(closeButtons[0] || allButtons[allButtons.length - 1]);
        fireEvent.click(closeButtons[0]);
        expect(screen.getAllByLabelText(/^phone$/i).length).toBe(1);
    });

    // ─── UPDATE ───────────────────────────────────────────────

    test('opens edit dialog with prepopulated contact data', async () => {
        renderContacts();
        fireEvent.click(await screen.findByText('John Doe'));
        fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));
        expect(screen.getByRole('heading', { name: /edit contact/i })).toBeInTheDocument();
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    });

    test('updates contact successfully', async () => {
        API.put.mockResolvedValueOnce({ data: {} });
        renderContacts();
        fireEvent.click(await screen.findByText('John Doe'));
        fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));
        fireEvent.change(screen.getByDisplayValue('John'), { target: { value: 'Johnny' } });
        fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
        await waitFor(() =>
            expect(API.put).toHaveBeenCalledWith('/contacts/1', expect.objectContaining({
                firstName: 'Johnny',
            }))
        );
    });

    test('shows error when update contact fails', async () => {
        API.put.mockRejectedValueOnce(new Error('Update failed'));
        renderContacts();
        fireEvent.click(await screen.findByText('John Doe'));
        fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));
        fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
        await waitFor(async() => 
            expect(await screen.findByText(/failed to save contact/i)).toBeInTheDocument()
        );
    });

    // ─── DELETE ───────────────────────────────────────────────

    test('opens delete confirmation dialog from detail panel', async () => {
        renderContacts();
        fireEvent.click(await screen.findByText('John Doe'));
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        fireEvent.click(deleteButtons[0]);
        expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    });

    test('deletes contact successfully after confirmation', async () => {
        API.delete.mockResolvedValueOnce({ data: {} });
        renderContacts();
        fireEvent.click(await screen.findByText('John Doe'));
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        fireEvent.click(deleteButtons[0]);
        const confirmButtons = screen.getAllByRole('button', { name: /delete/i });
        fireEvent.click(confirmButtons[confirmButtons.length - 1]);
        await waitFor(() =>
            expect(API.delete).toHaveBeenCalledWith('/contacts/1')
        );
    });

    test('shows error when delete contact fails', async () => {
        API.delete.mockRejectedValueOnce(new Error('Delete failed'));
        renderContacts();
        fireEvent.click(await screen.findByText('John Doe'));
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        fireEvent.click(deleteButtons[0]);
        const confirmButtons = screen.getAllByRole('button', { name: /delete/i });
        fireEvent.click(confirmButtons[confirmButtons.length - 1]);
        await waitFor(async() => 
            expect(await screen.findByText(/failed to delete contact/i)).toBeInTheDocument()
        );
    });

    test('cancels delete dialog without deleting', async () => {
        renderContacts();
        fireEvent.click(await screen.findByText('John Doe'));
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        fireEvent.click(deleteButtons[0]);
        fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
        await waitFor(() =>
            expect(screen.queryByText(/are you sure you want to delete/i)).not.toBeInTheDocument()
        );
    });

    // ─── EXPORT ───────────────────────────────────────────────

    test('exports CSV successfully', async () => {
        window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
        renderContacts();
        await screen.findByText('John Doe');
        API.get.mockResolvedValueOnce({ data: new Blob(['csv content'], { type: 'text/csv' }) });
        fireEvent.click(screen.getByRole('button', { name: /export csv/i }));
        await waitFor(() =>
            expect(API.get).toHaveBeenCalledWith('/contacts/export', { responseType: 'blob' })
        );
    });

    test('shows error when export fails', async () => {
        renderContacts();
        await screen.findByText('John Doe');
        API.get.mockRejectedValueOnce(new Error('Export failed'));
        fireEvent.click(screen.getByRole('button', { name: /export csv/i }));
        await waitFor(async() => 
            expect(await screen.findByText(/export failed/i)).toBeInTheDocument()
        );
    });

    // ─── IMPORT ───────────────────────────────────────────────

   test('imports CSV file successfully', async () => {
        API.post.mockResolvedValueOnce({ data: {} });
        const { container } = renderContacts(); 
        await screen.findByText('John Doe');
        
        const file = new File(
            ['First Name,Last Name\nCharlie,Brown'],
            'contacts.csv',
            { type: 'text/csv' }
        );

        /* eslint-disable-next-line testing-library/no-container, testing-library/no-node-access */
        const input = container.querySelector('input[type="file"]');
        
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(API.post).toHaveBeenCalled();
        });
    });

    // ─── PAGINATION ───────────────────────────────────────────

    test('shows pagination when total pages greater than 1', async () => {
        API.get.mockResolvedValueOnce({
            data: { ...mockContactsData, totalPages: 3 },
        });
        renderContacts();
        await screen.findByText('John Doe');
        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    // ─── NAVIGATION ───────────────────────────────────────────

    test('navigates to profile page on profile button click', async () => {
        renderContacts();
        await screen.findByText('John Doe');
        fireEvent.click(screen.getByRole('button', { name: /profile/i }));
        expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    test('handles logout and navigates to login', async () => {
        localStorage.setItem('token', 'test-token');
        renderContacts();
        await screen.findByText('John Doe');
        fireEvent.click(screen.getByRole('button', { name: /logout/i }));
        expect(localStorage.getItem('token')).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    // ─── ALPHABETICAL GROUPING ────────────────────────────────

    test('groups contacts alphabetically by first letter', async () => {
        renderContacts();
        await screen.findByText('John Doe');
        expect(screen.getByText('J')).toBeInTheDocument();
    });
});