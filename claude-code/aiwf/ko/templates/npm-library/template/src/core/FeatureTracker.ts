import { Feature } from '../types';
import { generateId } from '../utils/helpers';

/**
 * Feature tracking functionality
 */
export class FeatureTracker {
  private features: Map<string, Feature> = new Map();
  private projectName: string;

  constructor(projectName: string) {
    this.projectName = projectName;
  }

  /**
   * Add a new feature
   */
  addFeature(feature: Omit<Feature, 'id' | 'createdAt'>): Feature {
    const newFeature: Feature = {
      ...feature,
      id: generateId('F'),
      createdAt: new Date(),
    };

    this.features.set(newFeature.id, newFeature);
    return newFeature;
  }

  /**
   * Update feature status
   */
  updateFeatureStatus(
    featureId: string,
    status: Feature['status']
  ): Feature | undefined {
    const feature = this.features.get(featureId);
    if (!feature) return undefined;

    feature.status = status;
    if (status === 'completed') {
      feature.completedAt = new Date();
    }

    return feature;
  }

  /**
   * Get all features
   */
  getAllFeatures(): Feature[] {
    return Array.from(this.features.values());
  }

  /**
   * Get features by status
   */
  getFeaturesByStatus(status: Feature['status']): Feature[] {
    return this.getAllFeatures().filter((f) => f.status === status);
  }

  /**
   * Get feature statistics
   */
  getStatistics(): Record<string, number> {
    const features = this.getAllFeatures();
    return {
      total: features.length,
      completed: features.filter((f) => f.status === 'completed').length,
      inProgress: features.filter((f) => f.status === 'in_progress').length,
      planned: features.filter((f) => f.status === 'planned').length,
    };
  }

  /**
   * Export features as JSON
   */
  exportToJSON(): string {
    return JSON.stringify(
      {
        projectName: this.projectName,
        features: this.getAllFeatures(),
        statistics: this.getStatistics(),
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }
}