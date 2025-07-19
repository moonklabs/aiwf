/**
 * 스프린트 태스크 관리 테스트
 */

import { jest } from '@jest/globals';
import { addTaskToSprint } from '../../src/commands/sprint-task.js';

// Manual mocks
const mockFs = {
  access: jest.fn(),
  readdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn()
};

// Mock the fs/promises module
jest.unstable_mockModule('fs/promises', () => mockFs);

describe('Sprint Task Management', () => {
  const mockProjectRoot = '/test/project';
  const mockSprintPath = '/test/project/.aiwf/03_SPRINTS/S03_M02_test_sprint';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods
    global.console.log = jest.fn();
    global.console.warn = jest.fn();
    global.console.error = jest.fn();
  });
  
  describe('addTaskToSprint', () => {
    it('should successfully add a task to an existing sprint', async () => {
      // Mock file system operations
      mockFs.access.mockResolvedValue();
      mockFs.readdir
        .mockResolvedValueOnce(['.aiwf']) // Project root check
        .mockResolvedValueOnce(['S01_M01_sprint1', 'S03_M02_test_sprint']) // Sprint directory
        .mockResolvedValueOnce(['T01_S03_existing_task.md', 'S03_sprint_meta.md']); // Sprint contents
      
      mockFs.readFile.mockResolvedValueOnce(`# S03 Sprint Meta
## 태스크 목록
- [ ] T01: Existing Task - 상태: pending
`);
      
      mockFs.writeFile.mockResolvedValue();
      
      // Execute
      const result = await addTaskToSprint('S03', 'New Test Task');
      
      // Verify
      expect(result.success).toBe(true);
      expect(result.taskNumber).toBe('T02');
      expect(mockFs.writeFile).toHaveBeenCalledTimes(3); // Task file, sprint meta, manifest
    });
    
    it('should handle first task in sprint correctly', async () => {
      // Mock empty sprint
      mockFs.access.mockResolvedValue();
      mockFs.readdir
        .mockResolvedValueOnce(['.aiwf'])
        .mockResolvedValueOnce(['S03_M02_test_sprint'])
        .mockResolvedValueOnce(['S03_sprint_meta.md']); // No task files
      
      mockFs.readFile.mockResolvedValueOnce(`# S03 Sprint Meta
## 개요
Test sprint
`);
      
      mockFs.writeFile.mockResolvedValue();
      
      const result = await addTaskToSprint('S03', 'First Task');
      
      expect(result.taskNumber).toBe('T01');
    });
    
    it('should throw error when sprint does not exist', async () => {
      mockFs.access.mockResolvedValue();
      mockFs.readdir
        .mockResolvedValueOnce(['.aiwf'])
        .mockResolvedValueOnce(['S01_M01_sprint1']); // S03 not found
      
      await expect(addTaskToSprint('S03', 'Test Task'))
        .rejects.toThrow('스프린트 S03를 찾을 수 없습니다.');
    });
    
    it('should sanitize task title for filename', async () => {
      mockFs.access.mockResolvedValue();
      mockFs.readdir
        .mockResolvedValueOnce(['.aiwf'])
        .mockResolvedValueOnce(['S03_M02_test_sprint'])
        .mockResolvedValueOnce([]);
      
      mockFs.readFile.mockResolvedValueOnce('# Sprint Meta');
      mockFs.writeFile.mockResolvedValue();
      
      await addTaskToSprint('S03', 'Task with Special!@# Characters');
      
      // Check that the filename was sanitized
      const writeCall = mockFs.writeFile.mock.calls[0];
      const filePath = writeCall[0];
      expect(filePath).toMatch(/T01_S03_task_with_special_characters\.md$/);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle missing .aiwf directory', async () => {
      mockFs.access.mockRejectedValue(new Error('Not found'));
      
      await expect(addTaskToSprint('S03', 'Test'))
        .rejects.toThrow('.aiwf 디렉토리를 찾을 수 없습니다');
    });
    
    it('should warn when sprint meta file is missing', async () => {
      mockFs.access.mockResolvedValue();
      mockFs.readdir
        .mockResolvedValueOnce(['.aiwf'])
        .mockResolvedValueOnce(['S03_M02_test_sprint'])
        .mockResolvedValueOnce([]); // No meta file
      
      mockFs.writeFile.mockResolvedValue();
      
      await addTaskToSprint('S03', 'Test Task');
      
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('스프린트 메타 파일을 찾을 수 없습니다')
      );
    });
  });
  
  describe('Task Numbering', () => {
    it('should correctly determine next task number', async () => {
      mockFs.access.mockResolvedValue();
      mockFs.readdir
        .mockResolvedValueOnce(['.aiwf'])
        .mockResolvedValueOnce(['S03_M02_test_sprint'])
        .mockResolvedValueOnce([
          'T01_S03_task1.md',
          'T03_S03_task3.md',
          'T10_S03_task10.md',
          'S03_sprint_meta.md'
        ]);
      
      mockFs.readFile.mockResolvedValueOnce('# Sprint Meta');
      mockFs.writeFile.mockResolvedValue();
      
      const result = await addTaskToSprint('S03', 'Next Task');
      
      expect(result.taskNumber).toBe('T11'); // Next after T10
    });
    
    it('should handle non-standard task filenames', async () => {
      mockFs.access.mockResolvedValue();
      mockFs.readdir
        .mockResolvedValueOnce(['.aiwf'])
        .mockResolvedValueOnce(['S03_M02_test_sprint'])
        .mockResolvedValueOnce([
          'T01_S03_task1.md',
          'random_file.txt',
          'TX05_not_a_task.md',
          'S03_sprint_meta.md'
        ]);
      
      mockFs.readFile.mockResolvedValueOnce('# Sprint Meta');
      mockFs.writeFile.mockResolvedValue();
      
      const result = await addTaskToSprint('S03', 'Next Task');
      
      expect(result.taskNumber).toBe('T02'); // Only counts valid task files
    });
  });
});