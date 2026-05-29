import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', phoneNumber: '03001234567' },
        { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phoneNumber: '03117654321' }
    ],
    totalPages: 1,
    totalElements: 2
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

    test('renders structural headers and action utilities safely', async () => {
        renderContacts();

        await screen.findByRole('heading', { name: /contacts/i });
        await screen.findByPlaceholderText(/search by first or last name\.{3}/i);
        await screen.findByRole('button', { name: /new contact/i });
    });

    test('displays loaded contact data from search backend successfully', async () => {
        renderContacts();

        expect(await screen.findByText(/John/i)).toBeInTheDocument();
        expect(await screen.findByText(/Jane/i)).toBeInTheDocument();
    });

    test('triggers search requests on input variance cleanly', async () => {
    renderContacts();

    const searchInput = screen.getByPlaceholderText(/search by first or last name\.\.\./i);

    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => expect(API.get).toHaveBeenCalledWith(expect.stringContaining('query=John')));
});

    test('closes detail panel on close button or structural fallback target click', async () => {
        renderContacts();

       const firstContactRow = await screen.findByText(/John/i);
        fireEvent.click(firstContactRow);

        const closeTarget = await screen.findByRole('button', { name: /close/i });
        fireEvent.click(closeTarget);

        await waitFor(() => expect(screen.queryByText('Contact Details Info')).not.toBeInTheDocument());
    });
});