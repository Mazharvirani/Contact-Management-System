import React from 'react';
import {
    render,
    screen,
    waitFor,
    fireEvent
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Contacts from './Contacts';
import API from '../api/axios';

jest.setTimeout(15000);

// ---------------- MOCK NAVIGATION ----------------

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Routes: ({ children }) => <div>{children}</div>,
    Route: ({ element }) => element,
    Navigate: () => null,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    useNavigate: () => mockNavigate,
}));

// ---------------- MOCK API ----------------

jest.mock('../api/axios', () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
}));

// ---------------- MOCK DATA ----------------

const mockContactsResponse = {
    data: {
        content: [
            {
                id: 1,
                firstName: 'Alice',
                lastName: 'Smith',
                title: 'Software Engineer',
                phones: [
                    {
                        phone: '123456',
                        label: 'home',
                    },
                ],
                emails: [
                    {
                        email: 'alice@example.com',
                        label: 'work',
                    },
                ],
            },
            {
                id: 2,
                firstName: 'Bob',
                lastName: 'Jones',
                title: 'Designer',
                phones: [
                    {
                        phone: '789012',
                        label: 'work',
                    },
                ],
                emails: [
                    {
                        email: 'bob@example.com',
                        label: 'home',
                    },
                ],
            },
        ],
        totalPages: 1,
        totalElements: 2,
    },
};

// ---------------- RENDER HELPER ----------------

const renderComponent = () => {
    return render(
        <BrowserRouter>
            <Contacts />
        </BrowserRouter>
    );
};

// ---------------- TESTS ----------------

describe('Contacts Component Coverage Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        API.get.mockResolvedValue(mockContactsResponse);
    });

    // ---------- READ TEST ----------

    test('renders contacts list successfully', async () => {

        renderComponent();

        expect(API.get).toHaveBeenCalledWith(
            '/contacts?page=0&size=10'
        );

        expect(
            await screen.findByText('Alice Smith')
        ).toBeInTheDocument();

        expect(
            screen.getByText('Bob Jones')
        ).toBeInTheDocument();

        expect(
            screen.getByText('2 contacts')
        ).toBeInTheDocument();
    });

    // ---------- EMPTY STATE ----------

    test('renders empty state correctly', async () => {

        API.get.mockResolvedValueOnce({
            data: {
                content: [],
                totalPages: 0,
                totalElements: 0,
            },
        });

        renderComponent();

        expect(
            await screen.findByText(/no contacts yet/i)
        ).toBeInTheDocument();

        expect(
            screen.getByText(/create your first contact/i)
        ).toBeInTheDocument();
    });

    // ---------- ERROR STATE ----------

    test('shows error alert when API fails', async () => {

        API.get.mockRejectedValueOnce(
            new Error('Network Error')
        );

        renderComponent();

        expect(
            await screen.findByText(/failed to load contacts/i)
        ).toBeInTheDocument();
    });

    // ---------- DETAILS PANEL ----------

    test('opens and closes contact details panel', async () => {

        renderComponent();

        const contactItem =
            await screen.findByText('Alice Smith');

        fireEvent.click(contactItem);

        expect(
            screen.getAllByText('Alice Smith').length
        ).toBeGreaterThan(1);

        expect(
            screen.getByText('123456')
        ).toBeInTheDocument();

        expect(
            screen.getByText('alice@example.com')
        ).toBeInTheDocument();

    
        const closeBtn = screen.getByRole('button', {
            name: /close/i,
        });

        fireEvent.click(closeBtn);

        await waitFor(() => {
            expect(
                screen.getAllByText('Alice Smith')
            ).toHaveLength(1);
        });
    });

    // ---------- SEARCH ----------

    test('searches contacts correctly', async () => {

        renderComponent();

        await screen.findByText('Alice Smith');

        API.get.mockResolvedValueOnce({
            data: {
                content: [
                    mockContactsResponse.data.content[0],
                ],
                totalPages: 1,
                totalElements: 1,
            },
        });

        const searchInput =
            screen.getByPlaceholderText(
                /search by first or last name/i
            );

        await userEvent.type(searchInput, 'Alice');

        await waitFor(() => {
            expect(API.get).toHaveBeenCalledWith(
                '/contacts/search?query=Alice&page=0&size=10'
            );
        });
    });

    // ---------- CREATE ----------

    test('creates new contact successfully', async () => {

        renderComponent();

        await screen.findByText('Alice Smith');

        const newBtn = screen.getByRole('button', {
            name: /new contact/i,
        });

        fireEvent.click(newBtn);

        expect(
            screen.getByRole('heading', {
                name: /new contact/i,
            })
        ).toBeInTheDocument();

        await userEvent.type(
            screen.getByLabelText(/first name/i),
            'Charlie'
        );

        await userEvent.type(
            screen.getByLabelText(/last name/i),
            'Brown'
        );

        await userEvent.type(
            screen.getByLabelText(/title/i),
            'Manager'
        );

        await userEvent.type(
            screen.getByLabelText(/phone/i),
            '5551234'
        );

        await userEvent.type(
            screen.getByLabelText(/email/i),
            'charlie@test.com'
        );

        API.post.mockResolvedValueOnce({
            data: {},
        });

        fireEvent.click(
            screen.getByRole('button', {
                name: /create contact/i,
            })
        );

        await waitFor(() => {
            expect(API.post).toHaveBeenCalled();
        });
    });

    // ---------- UPDATE ----------

    test('updates contact successfully', async () => {

        renderComponent();

        const contactItem =
            await screen.findByText('Alice Smith');

        fireEvent.click(contactItem);

        const editBtn = screen.getByRole('button', {
            name: /edit/i,
        });

        fireEvent.click(editBtn);

        expect(
            screen.getByRole('heading', {
                name: /edit contact/i,
            })
        ).toBeInTheDocument();

        const firstNameInput =
            screen.getByLabelText(/first name/i);

        await userEvent.clear(firstNameInput);

        await userEvent.type(
            firstNameInput,
            'Alisha'
        );

        API.put.mockResolvedValueOnce({
            data: {},
        });

        fireEvent.click(
            screen.getByRole('button', {
                name: /save changes/i,
            })
        );

        await waitFor(() => {
            expect(API.put).toHaveBeenCalledWith(
                '/contacts/1',
                expect.objectContaining({
                    firstName: 'Alisha',
                })
            );
        });
    });

    // ---------- DELETE ----------

    test('deletes contact successfully', async () => {

        renderComponent();

        const contactItem =
            await screen.findByText('Bob Jones');

        fireEvent.click(contactItem);

        const deleteButtons =
            screen.getAllByRole('button', {
                name: /delete/i,
            });

        fireEvent.click(deleteButtons[0]);

        expect(
            screen.getByText(
                /are you sure you want to delete/i
            )
        ).toBeInTheDocument();

        API.delete.mockResolvedValueOnce({
            data: {},
        });

        const confirmDeleteButtons =
            screen.getAllByRole('button', {
                name: /delete/i,
            });

        fireEvent.click(
            confirmDeleteButtons[
                confirmDeleteButtons.length - 1
            ]
        );

        await waitFor(() => {
            expect(API.delete).toHaveBeenCalledWith(
                '/contacts/2'
            );
        });
    });

    // ---------- LOGOUT ----------

    test('handles logout correctly', async () => {

        storageMock();

        window.localStorage.setItem(
            'token',
            'dummy-token'
        );

        renderComponent();

        await screen.findByText('Alice Smith');

        const logoutBtn = screen.getByRole('button', {
            name: /logout/i,
        });

        fireEvent.click(logoutBtn);

        expect(
            window.localStorage.getItem('token')
        ).toBeNull();

        expect(mockNavigate).toHaveBeenCalledWith(
            '/login'
        );
    });

    // ---------- EXPORT ----------

    test('exports CSV successfully', async () => {

        window.URL.createObjectURL = jest.fn(
            () => 'blob:mock-url'
        );

        API.get.mockResolvedValueOnce({
            data: new Blob(
                ['csv content'],
                { type: 'text/csv' }
            ),
        });

        renderComponent();

        const exportBtn = screen.getByRole('button', {
            name: /export csv/i,
        });

        fireEvent.click(exportBtn);

        await waitFor(() => {
            expect(API.get).toHaveBeenCalledWith(
                '/contacts/export',
                { responseType: 'blob' }
            );
        });
    });
});

// ---------------- LOCAL STORAGE MOCK ----------------

function storageMock() {

    let storage = {};

    Object.defineProperty(window, 'localStorage', {
        value: {
            setItem(key, value) {
                storage[key] = value;
            },

            getItem(key) {
                return storage[key] || null;
            },

            removeItem(key) {
                delete storage[key];
            },

            clear() {
                storage = {};
            },
        },

        writable: true,
    });
}