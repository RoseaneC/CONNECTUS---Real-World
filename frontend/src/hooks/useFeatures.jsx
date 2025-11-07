/**
 * Hook centralizado para gerenciar feature flags
 * Com suporte a debug via query params (?debugImpact=1)
 */

export function useFeatures() {
  // Vite injeta tudo como string; undefined se não existir
  const rawImpact = import.meta.env.VITE_FEATURE_IMPACT_SCORE;
  const rawGreen = import.meta.env.VITE_FEATURE_GREENUS;

  // Query param para debug: ?debugImpact=1 ou ?debugGreen=1
  const params = new URLSearchParams(window.location.search);
  const debugImpact = params.get('debugImpact') === '1';
  const debugGreen = params.get('debugGreen') === '1';

  const FEATURE_IMPACT = (rawImpact === 'true') || debugImpact;
  const FEATURE_GREEN = (rawGreen === 'true') || debugGreen;

  // Logs de diagnóstico no primeiro load
  if (!window.__features_logged__) {
    window.__features_logged__ = true;
    console.log('[FEATURES] =================================');
    console.log('[FEATURES] VITE_FEATURE_IMPACT_SCORE =', rawImpact, '| via .env');
    console.log('[FEATURES] VITE_FEATURE_GREENUS      =', rawGreen, '| via .env');
    console.log('[FEATURES] debugImpact param         =', debugImpact);
    console.log('[FEATURES] debugGreen param          =', debugGreen);
    console.log('[FEATURES] Effective FEATURE_IMPACT  =', FEATURE_IMPACT);
    console.log('[FEATURES] Effective FEATURE_GREEN   =', FEATURE_GREEN);
    console.log('[FEATURES] =================================');
  }

  return { 
    FEATURE_IMPACT, 
    FEATURE_GREEN, 
    debugImpact,
    debugGreen 
  };
}


