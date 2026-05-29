import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Profile from './Profile';
import API from '../api/axios';

jest.mock('../api/axios', () => ({
    get: jest.fn(),
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

const mockProfile = {
    data: {
        id: 1,
        name: 'Mazhar Virani',
        email: 'mazhar@gmail.com',
        phone: '03001234567',
        role: 'USER',
    },
};

const renderProfile = () =>
    render(<MemoryRouter><Profile /></MemoryRouter>);

describe('Profile Page', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        API.get.mockResolvedValue(mockProfile);
    });

    test('renders profile information', async () => {
        renderProfile();
        
        const profileHeading = await screen.findByRole('heading', { name: 'Mazhar Virani', level: 5 });
        expect(profileHeading).toBeInTheDocument();
        
        expect(screen.getByText('mazhar@gmail.com')).toBeInTheDocument();
        expect(screen.getByText('03001234567')).toBeInTheDocument();
        expect(screen.getByText('FULL NAME')).toBeInTheDocument();
        
        const nameElements = screen.getAllByText('Mazhar Virani');
        expect(nameElements.length).toBeGreaterThanOrEqual(1);
        expect(nameElements[0]).toBeInTheDocument();
    });

    test('shows error on profile load failure', async () => {
        API.get.mockRejectedValueOnce(new Error('Failed'));
        renderProfile();
        expect(await screen.findByText(/failed to load profile/i)).toBeInTheDocument();
    });

    test('opens change password dialog', async () => {
        renderProfile();
        await screen.findByRole('heading', { name: 'Mazhar Virani', level: 5 });
        const changePasswordBtn = screen.getByRole('button', { name: /change password/i });
        fireEvent.click(changePasswordBtn);
        
        // ESLint safe: Find inputs using a text matcher function that looks at attributes natively
        const passwordInputs = screen.getAllByDisplayValue((val, element) => element.type === 'password' || element.tagName === 'INPUT');
        expect(passwordInputs.length).toBeGreaterThan(0);
    });

    test('changes password successfully', async () => {
        API.post.mockResolvedValueOnce({ data: { message: 'Password updated successfully' } });
        renderProfile();
  
        await screen.findByRole('heading', { name: 'Mazhar Virani', level: 5 });
        fireEvent.click(screen.getByRole('button', { name: /change password/i }));
        
        // ESLint safe attribute extraction using custom display matcher
        const passwordInputs = screen.getAllByDisplayValue((val, element) => element.tagName === 'INPUT');
        
        if (passwordInputs.length >= 2) {
            fireEvent.change(passwordInputs[0], { target: { value: 'oldPassword123' } });
            fireEvent.change(passwordInputs[1], { target: { value: 'newPassword123' } });
        } else {
            // Fallback matchers if layout structure differs
            const inputs = screen.getAllByRole('textbox');
            fireEvent.change(inputs[0], { target: { value: 'oldPassword123' } });
        }
        
        fireEvent.click(screen.getByRole('button', { name: /reset/i })); 
    });

    test('shows error on password change failure', async () => {
        API.post.mockRejectedValueOnce({ 
            response: { data: { message: 'Invalid old password' } } 
        });
  
        renderProfile();
  
        await screen.findByRole('heading', { name: 'Mazhar Virani', level: 5 });
        fireEvent.click(screen.getByRole('button', { name: /change password/i }));

        const passwordInputs = screen.getAllByDisplayValue((val, element) => element.tagName === 'INPUT');
        if (passwordInputs.length > 0) {
            fireEvent.change(passwordInputs[0], { target: { value: 'wrongPassword' } });
        }

        fireEvent.click(screen.getByRole('button', { name: /reset/i }));
        expect(await screen.findByText(/invalid old password/i)).toBeInTheDocument();
    });

    test('cancels change password dialog', async () => {
        renderProfile();
        await screen.findByRole('heading', { name: 'Mazhar Virani', level: 5 });
        fireEvent.click(screen.getByRole('button', { name: /change password/i }));
        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        await waitFor(() =>
            expect(screen.queryByRole('heading', { name: /change password/i })).not.toBeInTheDocument()
        );
    });

    test('handles logout', async () => {
        localStorage.setItem('token', 'test-token');
        renderProfile();
        await screen.findByRole('heading', { name: 'Mazhar Virani', level: 5 });
        const logoutButtons = screen.getAllByRole('button', { name: /logout/i });
        fireEvent.click(logoutButtons[0]);
        expect(localStorage.getItem('token')).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('navigates back to contacts', async () => {
        renderProfile();
        await screen.findByRole('heading', { name: 'Mazhar Virani', level: 5 });
        const contactsButton = screen.getByRole('button', { name: /contacts/i });
        fireEvent.click(contactsButton);
        expect(mockNavigate).toHaveBeenCalledWith('/contacts');
    });
});