import dynamic from 'next/dynamic';

export const ExperimentRegistry: Record<string, React.ComponentType<Record<string, unknown>>> = {
  millikan: dynamic(() => import('./millikan/components/ExperimentView'), { ssr: false }),
  bandul: dynamic(() => import('./bandul/components/ExperimentView'), { ssr: false }),
};

export const AnalysisRegistry: Record<string, React.ComponentType<Record<string, unknown>>> = {
  millikan: dynamic(() => import('./millikan/components/AnalysisView'), { ssr: false }),
  bandul: dynamic(() => import('./bandul/components/AnalysisView'), { ssr: false }),
};
