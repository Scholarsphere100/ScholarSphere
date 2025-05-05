import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, remove, child, get } from "firebase/database";
import { renderMilestones, generateReport } from "../../js/milestone.js";

// Mock Firebase
jest.mock("firebase/app");
jest.mock("firebase/database");

describe('Milestone Tracking System', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="milestoneForm">
        <input id="name" value="Test Milestone">
        <textarea id="description">Test Description</textarea>
        <input id="dueDate" type="date" value="2025-12-31">
        <select id="project">
          <option value="project1">Project 1</option>
          <option value="project2">Project 2</option>
        </select>
        <select id="status">
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
        </select>
      </form>
      <div id="milestonesList"></div>
      <button id="generateReport">Generate Report</button>
    `;
  });

  test('should add a new milestone', () => {
    require('./milestone.js');
    const form = document.getElementById('milestoneForm');
    form.dispatchEvent(new Event('submit'));
    
    expect(push).toHaveBeenCalledWith(expect.anything(), {
      name: "Test Milestone",
      description: "Test Description",
      dueDate: "2025-12-31",
      project: "project1",
      status: "not-started",
      createdAt: expect.any(String)
    });
  });

  test('should render milestones correctly', () => {
    const mockData = {
      milestone1: {
        name: "Test Milestone",
        description: "Test Description",
        dueDate: "2025-12-31",
        project: "project1",
        status: "in-progress",
        createdAt: "2025-05-01"
      }
    };
    
    renderMilestones(mockData);
    const list = document.getElementById('milestonesList');
    expect(list.innerHTML).toContain("Test Milestone");
    expect(list.innerHTML).toContain("In Progress");
  });

  test('should generate a completion report', () => {
    const mockData = {
      milestone1: { project: "project1", status: "completed" },
      milestone2: { project: "project1", status: "in-progress" },
      milestone3: { project: "project2", status: "completed" }
    };
    
    const report = generateReport(mockData);
    expect(report.project1.completed).toBe(1);
    expect(report.project1.total).toBe(2);
    expect(report.project2.completionRate).toBe("100%");
  });
});