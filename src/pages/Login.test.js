import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';
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
    post: jest.fn(),
}));

const renderLogin = () =>
    render(
        <div data-testid="router-fallback-wrapper">
            <Login />
        </div>
    );

describe('Login Page', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders login form', () => {
        renderLogin();
        expect(screen.getByPlaceholderText(/enter your email or phone/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('logs in successfully', async () => {
        API.post.mockResolvedValueOnce({ data: 'mock.jwt.token' });
        renderLogin();
        
        fireEvent.change(screen.getByPlaceholderText(/enter your email or phone/i), {
            target: { value: 'test@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/contacts');
        });
    });

    test('shows error on failed login', async () => {
        API.post.mockRejectedValueOnce(new Error('Unauthorized'));
        renderLogin();
        
        fireEvent.change(screen.getByPlaceholderText(/enter your email or phone/i), {
            target: { value: 'wrong@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
            target: { value: 'wrongpass' },
        });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        
        await expect(screen.findByText(/invalid credentials/i)).resolves.toBeInTheDocument();
    });
    test('has link to register', () => {
        renderLogin();
        expect(screen.getByRole('link', { name: /^register$/i })).toBeInTheDocument();
    });
});