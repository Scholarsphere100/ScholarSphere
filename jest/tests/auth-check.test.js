/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';

describe('auth-check.js', () => {
  beforeEach(() => {
    // Mock the function globally before auth-check runs
    window.displayUserSpecificContent = jest.fn();

    // Mock session storage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
      },
      writable: true,
    });

    // Mock window.location
    delete window.location;
    window.location = { href: '' };
  });

  
  test('redirects to login if user is not logged in', async () => {
    sessionStorage.getItem.mockReturnValue(null);

    await import('../../js/auth-check.js');

    expect(window.location.href).toBe('../html/index.html');
  });

  test('redirects to admin dashboard if role is admin', async () => {
    sessionStorage.getItem.mockReturnValue(
      JSON.stringify({ role: 'admin' })
    );

    await import('../../js/auth-check.js');

    expect(window.location.href).toBe('../admin-dashboard.html');
  });

  test('calls displayUserSpecificContent for researcher role', async () => {
    const mockUserData = { role: 'researcher' };
    sessionStorage.getItem.mockReturnValue(JSON.stringify(mockUserData));

    await import('../../js/auth-check.js');

    expect(window.displayUserSpecificContent).toHaveBeenCalledWith(mockUserData);
  });

  test('redirects to researcher dashboard for unknown role', async () => {
    sessionStorage.getItem.mockReturnValue(
      JSON.stringify({ role: 'someUnknownRole' })
    );
await Promise.resolve();
await Promise.resolve();
await Promise.resolve();


    await import('../../js/auth-check.js');

    await Promise.resolve();
   await Promise.resolve();
await Promise.resolve();

    expect(window.location.href).toBe('../html/researcher-dashboard.html');
  });
});
