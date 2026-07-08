import React from 'react';

export default function StatusBadge({ status }) {
  const getBadgeClass = () => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'running':
      case 'step_autocomplete':
      case 'step_enrichment':
      case 'step_trends':
      case 'step_trends_enrichment':
      case 'step_clustering':
      case 'step_intent':
      case 'step_difficulty':
      case 'step_projection':
        return 'badge-info';
      case 'failed':
        return 'badge-danger';
      case 'created':
      default:
        return 'badge-neutral';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'created':
        return 'Created';
      case 'running':
        return 'Running';
      case 'step_autocomplete':
        return 'Autocomplete';
      case 'step_enrichment':
        return 'Enriching SV';
      case 'step_trends':
        return 'Fetching Trends';
      case 'step_trends_enrichment':
        return 'Enriching Trends';
      case 'step_clustering':
        return 'Clustering';
      case 'step_intent':
        return 'Classifying Intent';
      case 'step_difficulty':
        return 'Weighing Difficulty';
      case 'step_projection':
        return 'Projecting Value';
      default:
        return status;
    }
  };

  return (
    <span className={`badge ${getBadgeClass()}`}>
      {getLabel()}
    </span>
  );
}
