import '@testing-library/jest-dom';

// A absolute pure mock that never touches the underlying node_modules package structure
jest.mock('react-router-dom', () => {
    const React = require('react');
    return {
        BrowserRouter: ({ children }) => React.createElement('div', null, children),
        HashRouter: ({ children }) => React.createElement('div', null, children),
        Routes: ({ children }) => React.createElement('div', null, children),
        Route: ({ element }) => element,
        Navigate: () => null,
        Link: ({ children, to }) => React.createElement('a', { href: to }, children),
        NavLink: ({ children, to }) => React.createElement('a', { href: to }, children),
        useNavigate: () => jest.fn(),
        useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
        useParams: () => ({}),
        useSearchParams: () => [new URLSearchParams(), jest.fn()]
    };
});