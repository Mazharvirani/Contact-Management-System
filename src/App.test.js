
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page correctly', () => {
    render(<App />);

    const headers = screen.getAllByRole('heading', {
        name: /contact manager/i,
    });

    expect(headers.length).toBeGreaterThan(0);

    expect(
        screen.getByRole('heading', {
            name: /sign in/i,
        })
    ).toBeInTheDocument();
});