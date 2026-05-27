import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Contacts from '../pages/Contacts';
import API from '../api/axios';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();

// ✅ FIXED: Full react-router-dom mock (VERY IMPORTANT)
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    BrowserRouter: ({ children }) => children,
    Routes: ({ children }) => children,
    Route: ({ children }) => children,
    Navigate: () => null
}));

jest.mock('../api/axios');

describe('Contacts Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        API.get.mockResolvedValue({
            data: {
                content: [
                    {
                        id: 1,
                        firstName: 'John',
                        lastName: 'Doe',
                        title: 'Manager',
                        emails: [{ email: 'john@gmail.com', label: 'work' }],
                        phones: [{ phone: '03001234567', label: 'home' }]
                    }
                ],
                totalPages: 1,
                totalElements: 1
            }
        });
    });

    test('renders contacts page', async () => {
        render(<Contacts />);

        expect(screen.getByText(/Contact Manager/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
        });
    });

    test('opens create contact dialog', async () => {
        render(<Contacts />);

        fireEvent.click(screen.getByText(/New contact/i));

        expect(screen.getByText(/New Contact/i)).toBeInTheDocument();
    });

    test('opens edit dialog', async () => {
        render(<Contacts />);

        await waitFor(() => {
            expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/John Doe/i));
        fireEvent.click(screen.getByText(/Edit/i));

        expect(screen.getByText(/Edit Contact/i)).toBeInTheDocument();
    });

    test('search contacts', async () => {
        render(<Contacts />);

        const searchInput = screen.getByPlaceholderText(
            /Search by first or last name/i
        );

        fireEvent.change(searchInput, {
            target: { value: 'John' }
        });

        await waitFor(() => {
            expect(API.get).toHaveBeenCalled();
        });
    });

    test('logout navigates to login page', async () => {
        render(<Contacts />);

        fireEvent.click(screen.getByText(/Logout/i));

        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('open delete dialog', async () => {
        render(<Contacts />);

        await waitFor(() => {
            expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/John Doe/i));
        fireEvent.click(screen.getByText(/Delete/i));

        expect(screen.getByText(/Delete Contact/i)).toBeInTheDocument();
    });

    test('delete contact success', async () => {

        API.delete.mockResolvedValue({});

        render(<Contacts />);

        await waitFor(() => {
            expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/John Doe/i));
        fireEvent.click(screen.getByText(/Delete/i));

        const confirmDelete = screen.getAllByText(/Delete/i)[1];
        fireEvent.click(confirmDelete);

        await waitFor(() => {
            expect(API.delete).toHaveBeenCalled();
        });
    });

    test('create contact success', async () => {

        API.post.mockResolvedValue({});

        render(<Contacts />);

        fireEvent.click(screen.getByText(/New contact/i));

        fireEvent.change(screen.getByLabelText(/First Name/i), {
            target: { value: 'Ali' }
        });

        fireEvent.change(screen.getByLabelText(/Last Name/i), {
            target: { value: 'Khan' }
        });

        fireEvent.click(screen.getByText(/Create Contact/i));

        await waitFor(() => {
            expect(API.post).toHaveBeenCalled();
        });
    });

    test('edit contact success', async () => {

        API.put.mockResolvedValue({});

        render(<Contacts />);

        await waitFor(() => {
            expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/John Doe/i));
        fireEvent.click(screen.getByText(/Edit/i));

        fireEvent.change(screen.getByLabelText(/First Name/i), {
            target: { value: 'Updated John' }
        });

        fireEvent.click(screen.getByText(/Save Changes/i));

        await waitFor(() => {
            expect(API.put).toHaveBeenCalled();
        });
    });

    test('shows error when fetch fails', async () => {

        API.get.mockRejectedValueOnce(new Error('Error'));

        render(<Contacts />);

        await waitFor(() => {
            expect(
                screen.getByText(/Failed to load contacts/i)
            ).toBeInTheDocument();
        });
    });

    test('export contacts', async () => {

        API.get.mockResolvedValueOnce({
            data: new Blob(['csv data'])
        });

        global.URL.createObjectURL = jest.fn();

        render(<Contacts />);

        fireEvent.click(screen.getByText(/Export CSV/i));

        await waitFor(() => {
            expect(API.get).toHaveBeenCalled();
        });
    });

    test('import contacts', async () => {

        API.post.mockResolvedValue({});

        render(<Contacts />);

        const file = new File(['name,email'], 'contacts.csv', {
            type: 'text/csv'
        });

        const input = screen.getByLabelText(/import csv/i);

        fireEvent.change(input, {
            target: { files: [file] }
        });

        await waitFor(() => {
            expect(API.post).toHaveBeenCalled();
        });
    });

    test('close dialog', async () => {

        render(<Contacts />);

        fireEvent.click(screen.getByText(/New contact/i));
        fireEvent.click(screen.getByText(/Cancel/i));

        await waitFor(() => {
            expect(
                screen.queryByText(/New Contact/i)
            ).not.toBeInTheDocument();
        });
    });

    test('pagination changes page', async () => {

        API.get.mockResolvedValue({
            data: {
                content: [],
                totalPages: 2,
                totalElements: 20
            }
        });

        render(<Contacts />);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /Go to page 2/i })
            ).toBeInTheDocument();
        });
    });

});