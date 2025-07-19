import { FeatureTracker } from '../src/core/FeatureTracker';
import { Feature } from '../src/types';

describe('FeatureTracker', () => {
  let tracker: FeatureTracker;

  beforeEach(() => {
    tracker = new FeatureTracker('test-project');
  });

  describe('addFeature', () => {
    it('should add a new feature with generated ID', () => {
      const feature = tracker.addFeature({
        name: 'Test Feature',
        description: 'A test feature',
        type: 'feature',
        status: 'planned',
        tags: ['test'],
      });

      expect(feature.id).toMatch(/^F/);
      expect(feature.createdAt).toBeInstanceOf(Date);
      expect(tracker.getAllFeatures()).toHaveLength(1);
    });
  });

  describe('updateFeatureStatus', () => {
    it('should update feature status', () => {
      const feature = tracker.addFeature({
        name: 'Test Feature',
        description: 'A test feature',
        type: 'feature',
        status: 'planned',
        tags: ['test'],
      });

      const updated = tracker.updateFeatureStatus(feature.id, 'in_progress');
      expect(updated?.status).toBe('in_progress');
    });

    it('should set completedAt when status is completed', () => {
      const feature = tracker.addFeature({
        name: 'Test Feature',
        description: 'A test feature',
        type: 'feature',
        status: 'planned',
        tags: ['test'],
      });

      const updated = tracker.updateFeatureStatus(feature.id, 'completed');
      expect(updated?.completedAt).toBeInstanceOf(Date);
    });

    it('should return undefined for non-existent feature', () => {
      const updated = tracker.updateFeatureStatus('INVALID', 'completed');
      expect(updated).toBeUndefined();
    });
  });

  describe('getFeaturesByStatus', () => {
    beforeEach(() => {
      tracker.addFeature({
        name: 'Feature 1',
        description: 'Planned feature',
        type: 'feature',
        status: 'planned',
        tags: [],
      });
      tracker.addFeature({
        name: 'Feature 2',
        description: 'In progress feature',
        type: 'feature',
        status: 'in_progress',
        tags: [],
      });
      tracker.addFeature({
        name: 'Feature 3',
        description: 'Completed feature',
        type: 'feature',
        status: 'completed',
        tags: [],
      });
    });

    it('should filter features by status', () => {
      expect(tracker.getFeaturesByStatus('planned')).toHaveLength(1);
      expect(tracker.getFeaturesByStatus('in_progress')).toHaveLength(1);
      expect(tracker.getFeaturesByStatus('completed')).toHaveLength(1);
    });
  });

  describe('getStatistics', () => {
    it('should return correct statistics', () => {
      tracker.addFeature({
        name: 'Feature 1',
        description: 'Test',
        type: 'feature',
        status: 'completed',
        tags: [],
      });
      tracker.addFeature({
        name: 'Feature 2',
        description: 'Test',
        type: 'feature',
        status: 'in_progress',
        tags: [],
      });

      const stats = tracker.getStatistics();
      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.inProgress).toBe(1);
      expect(stats.planned).toBe(0);
    });
  });

  describe('exportToJSON', () => {
    it('should export features as JSON', () => {
      tracker.addFeature({
        name: 'Test Feature',
        description: 'Test',
        type: 'feature',
        status: 'planned',
        tags: ['test'],
      });

      const json = tracker.exportToJSON();
      const parsed = JSON.parse(json);

      expect(parsed.projectName).toBe('test-project');
      expect(parsed.features).toHaveLength(1);
      expect(parsed.statistics).toBeDefined();
      expect(parsed.exportedAt).toBeDefined();
    });
  });
});