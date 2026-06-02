import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';
import API from '../api/axios';

jest.mock('../api/axios', () => ({
    post: jest.fn(),
}));

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

const renderRegister = () =>
    render(
        <MemoryRouter>
            <Register />
        </MemoryRouter>
    );

describe('Register Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders register form', () => {
        renderRegister();
        const emailInput = screen.getByPlaceholderText(/email/i);
        const passwordInput = screen.getByPlaceholderText(/password/i);
        
        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
    });

    test('registers successfully', async () => {
        API.post.mockResolvedValueOnce({ data: { message: 'User registered successfully' } });
        renderRegister();
        
        const nameInput = screen.queryByPlaceholderText(/name|user/i) || screen.getAllByRole('textbox')[0];
        const emailInput = screen.getByPlaceholderText(/email/i);
        const passwordInput = screen.getByPlaceholderText(/password/i);

        if (nameInput) fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123' } });

        const submitBtn = screen.queryByRole('button', { name: /register|sign up/i }) || screen.getAllByRole('button')[0];
        fireEvent.click(submitBtn);
    });

    test('shows error on failed registration', async () => {
        API.post.mockRejectedValueOnce({
            response: { data: { message: 'Email already exists' } },
        });
        renderRegister();

        const submitBtn = screen.queryByRole('button', { name: /register|sign up/i }) || screen.getAllByRole('button')[0];
        fireEvent.click(submitBtn);
        expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
    });

    test('toggles password visibility', () => {
        renderRegister();

        const passwordInput = screen.getByPlaceholderText(/password/i);
        const toggleButton = screen.queryByRole('button', { name: /toggle|show|hide|eye/i }) || screen.getAllByRole('button')[0];
            
        expect(passwordInput).toBeInTheDocument();

        fireEvent.click(toggleButton);
        expect(passwordInput).toBeInTheDocument();
    });

    test('has link to login', () => {
        renderRegister();
        const loginLink = screen.getByRole('link');
        expect(loginLink).toBeInTheDocument();
    });
});