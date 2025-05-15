/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';

import { addNewResearchItem, clearResearchItems } from '../../js/search';

await Promise.resolve();
await Promise.resolve();
await Promise.resolve();

describe('search.js DOM manipulation', () => {
  let container;

  beforeEach(() => {
    // Set up a basic DOM structure for each test
    document.body.innerHTML = `
      <ul class="search-result"></ul>
    `;
    container = document.querySelector('.search-result');
  });

  test('addNewResearchItem creates and appends a new item to the list', () => {
    addNewResearchItem(
      'AI Research',
      'Exploring AI applications.',
      'Python, ML',
      '2025-05-15',
      'project123'
    );

    const items = container.querySelectorAll('li.search-item');
    expect(items.length).toBe(1);

    const title = items[0].querySelector('h2').textContent;
    const desc = items[0].querySelector('.project-search-description').textContent;
    const skills = items[0].querySelector('.project-skills').textContent;
    const time = items[0].querySelector('time').textContent;
    const button = items[0].querySelector('button');

    expect(title).toBe('AI Research');
    expect(desc).toBe('Exploring AI applications.');
    expect(skills).toContain('Skills needed:');
    expect(skills).toContain('Python, ML');
    expect(time).toContain('Created: 2025-05-15');
    expect(button.textContent).toBe('Send Request');
    expect(button.id).toBe('project123');
  });

  test('addNewResearchItem does nothing if .search-result is not found', () => {
    // Remove the container
    document.body.innerHTML = '';

    const spy = jest.spyOn(document, 'createElement');
    addNewResearchItem('X', 'Y', 'Z', '2025-01-01', 'id123');
    expect(spy).not.toHaveBeenCalled(); // Should not even try to create elements
    spy.mockRestore();
  });

  test('clearResearchItems removes all items from the list', () => {
    // Add some items manually
    container.innerHTML = `
      <li class="search-item">Item 1</li>
      <li class="search-item">Item 2</li>
    `;

    clearResearchItems();

    const items = container.querySelectorAll('li.search-item');
    expect(items.length).toBe(0);
    expect(container.innerHTML).toBe('');
  });

  test('clearResearchItems does nothing if .search-result is not found', () => {
    document.body.innerHTML = ''; // No .search-result

    expect(() => {
      clearResearchItems();
    }).not.toThrow();
  });
});
