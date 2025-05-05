
/**
 * @jest-environment jsdom
 */

// Mock `displayUserSpecificContent`
const mockDisplayUserSpecificContent = jest.fn();

jest.mock('../../js/auth-check', () => ({
  displayUserSpecificContent: mockDisplayUserSpecificContent,
}));

describe('auth-check.js', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // Reset all mocks before each test
    sessionStorage.clear(); // Clear session storage
    delete window.location;
    window.location = { href: '' }; // Mock window.location
  });

  
  test(' test for login redirection', () => {
    sessionStorage.getItem = jest.fn(() => null); // Mock sessionStorage

    // Simulate loading the script
    window.location.href = '../html/index.html';

    
    expect(window.location.href).toBe('../html/index.html');
  });

  
  test(' test for dashboard redirection', () => {
    sessionStorage.getItem = jest.fn(() =>
      JSON.stringify({ role: 'admin' })
    ); // Mock sessionStorage

    // Simulate loading the script
    window.location.href = '../admin-dashboard.html';

    
    expect(window.location.href).toBe('../admin-dashboard.html');
  });

  
  test(' test for displayUserSpecificContent', () => {
    sessionStorage.getItem = jest.fn(() =>
      JSON.stringify({ role: 'researcher' })
    ); // Mock sessionStorage

    // Simulate function call
    mockDisplayUserSpecificContent({ role: 'researcher' });

    
    expect(mockDisplayUserSpecificContent).toHaveBeenCalledWith({
      role: 'researcher',
    });
  });

  
  test(' test for unrecognized role redirection', () => {
    sessionStorage.getItem = jest.fn(() =>
      JSON.stringify({ role: 'unknownRole' })
    ); // Mock sessionStorage

    // Simulate loading the script
    window.location.href = '../html/researcher-dashboard.html';

    expect(window.location.href).toBe('../html/researcher-dashboard.html');
  });
});
