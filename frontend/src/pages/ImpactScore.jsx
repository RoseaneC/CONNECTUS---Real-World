import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Award, Shield, Plus, FileText, Info, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getScore, listEvents, postEvent, attestMock } from '../services/impactApi';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/useI18n';
import { t as translations } from '../i18n/t';
import { WEB3_CONFIG } from '@/web3/addresses';

const ImpactScore = () => {
  const { lang } = useI18n();
  const impactText = translations[lang]?.impact || translations.pt.impact;
  const locale = lang === 'en' ? 'en-US' : 'pt-BR';

  const { user } = useAuth();
  const [score, setScore] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAttesting, setIsAttesting] = useState(false);
  
  // Form state
  const [eventType, setEventType] = useState('');
  const [importance, setImportance] = useState('');
  const [advancedMetadata, setAdvancedMetadata] = useState('{}');
  const [advancedEnabled, setAdvancedEnabled] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Carregar dados
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Buscar score e eventos
      const [scoreData, eventsData] = await Promise.all([
        getScore(user.id),
        listEvents(user.id, 1, 10)
      ]);
      
      setScore(scoreData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    try {
      if (!eventType) {
        toast.error(impactText.errors.selectType);
        return;
      }

      if (!evidenceFile && !evidenceUrl.trim()) {
        toast.error(impactText.errors.proofRequired);
        return;
      }

      let importanceValue;
      if (importance.trim()) {
        importanceValue = Number.parseFloat(importance);
        if (!Number.isFinite(importanceValue) || importanceValue < 1 || importanceValue > 5) {
          toast.error(impactText.errors.importanceRange);
          return;
        }
      }

      let metadata = {};
      if (advancedEnabled && advancedMetadata.trim()) {
        try {
          metadata = JSON.parse(advancedMetadata);
        } catch (error) {
          toast.error(impactText.errors.metadataInvalid);
          return;
        }
      }

      const cleanedUrl = evidenceUrl.trim();
      if (evidenceFile) {
        const base64Content = await readFileAsBase64(evidenceFile);
        metadata.evidence_file = {
          name: evidenceFile.name,
          type: evidenceFile.type || 'application/octet-stream',
          content: base64Content
        };
      } else if (cleanedUrl) {
        metadata.evidence_url = cleanedUrl;
      }

      if (notes.trim()) {
        metadata.notes = notes.trim();
      }

      const payload = {
        type: eventType,
        weight: importanceValue ?? undefined,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined
      };

      await postEvent(payload);
      
      toast.success(impactText.messages.createSuccess);
      setIsModalOpen(false);
      
      // Reset form
      setEventType('');
      setImportance('');
      setEvidenceFile(null);
      setEvidenceUrl('');
      setNotes('');
      if (!advancedEnabled) {
        setAdvancedMetadata('{}');
      }

      await loadData();
    } catch (error) {
      console.error('Erro ao criar evento:', error);
    }
  };

  const handleAttest = async () => {
    if (isAttesting) return;
    
    try {
      setIsAttesting(true);
      const result = await attestMock();
      
      toast.success(
        <div>
          <p className="font-semibold">{impactText.messages.attestationTitle}</p>
          <p className="text-sm text-gray-300">{impactText.messages.attestationIdLabel}: {result.attestation_id}</p>
          <p className="text-sm text-gray-300">{impactText.messages.attestationHashLabel}: {result.hash.substring(0, 20)}...</p>
        </div>,
        { duration: 5000 }
      );
    } catch (error) {
      console.error('Erro ao criar attestation:', error);
    } finally {
      setIsAttesting(false);
    }
  };

  const isMockMode = WEB3_CONFIG.DEMO_MODE || !WEB3_CONFIG.isConfigured;

  const eventKeys = ['mission_completed', 'community_vote', 'peer_review', 'donation'];
  const eventTypeLabels = impactText.eventTypes;

  const eventOptions = eventKeys.map((value) => ({
    value,
    label: eventTypeLabels[value] || value,
  }));

  const impactCardOrder = ['mission', 'vote', 'peer', 'donation'];
  const impactCards = impactCardOrder
    .map((key) => ({ key, ...impactText.cards[key] }))
    .filter((card) => card && card.title);

  const loadingLabel = lang === 'en' ? 'Loading...' : 'Carregando...';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-base">{loadingLabel}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isMockMode && (
        <div className="flex items-start gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-yellow-100 text-sm">
          <Info className="w-5 h-5 mt-0.5" aria-hidden="true" />
          <span>
            <strong>{impactText.bannerTitle}</strong> — {impactText.bannerSubtitle}
          </span>
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold text-white">{impactText.pageTitle}</h1>
        <p className="text-sm opacity-70">{impactText.socialPointsTitle}</p>
        <p className="text-dark-400 text-base sm:text-sm">
          {impactText.pageSubtitle}
        </p>
        {isMockMode && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg" title={impactText.bannerSubtitle}>
            <Shield className="w-5 h-5 text-yellow-400" aria-hidden="true" />
            <span className="text-sm text-yellow-400">{impactText.bannerTitle}</span>
          </div>
        )}
      </motion.div>

      {/* Cards explicativos */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-semibold text-white text-center">{impactText.cardsTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {impactCards.map((card) => (
            <div key={card.key} className="rounded-xl border border-white/10 bg-white/5 p-4 text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">{card.icon}</span>
                <h3 className="font-semibold text-sm sm:text-base">{card.title}</h3>
              </div>
              <p className="mt-2 text-sm opacity-80 leading-relaxed">{card.description}</p>
              <div className="mt-3 text-sm opacity-70">
                {lang === 'en' ? 'Base weight:' : 'Peso padrão:'} <span className="font-medium uppercase">{card.weight}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1 text-sm opacity-80 text-center">
          <span title={impactText.cardsTooltip}>ℹ️ {impactText.cardsTooltipLabel}</span>
        </div>
      </motion.div>

      {/* Score Principal */}
      {score && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card variant="glow" className="text-center py-8">
            <Award className="w-16 h-16 text-accent-400 mx-auto mb-4" aria-hidden="true" />
            <div className="text-5xl font-bold text-white mb-2">{score.score.toFixed(1)}</div>
            <p className="text-dark-400 mb-4" title={impactText.socialPointsTitle}>{impactText.socialPoints}</p>
            <p className="text-sm text-dark-500">
              {impactText.lastUpdate}: {new Date(score.updated_at).toLocaleDateString(locale)}
            </p>
          </Card>
        </motion.div>
      )}

      {/* Breakdown */}
      {score && score.breakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card variant="glass">
            <h2 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-400" aria-hidden="true" />
              {impactText.summaryTitle}
            </h2>
            <small className="text-xs opacity-70">{impactText.summarySubtitle}</small>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(score.breakdown).map(([type, count]) => (
                <div key={type} className="text-center">
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-sm text-dark-400">{eventTypeLabels[type] || type}</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Eventos Recentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
          <Card variant="glass">
          <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-400" aria-hidden="true" />
                  {impactText.recentActions}
                </h2>
                <small className="text-xs opacity-70">{impactText.recentActionsSubtitle}</small>
              </div>
              <Button onClick={() => setIsModalOpen(true)} variant="primary" size="sm" title={impactText.manualActionTitle}>
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                {impactText.manualAction}
              </Button>
          </div>
          
          {events.length === 0 ? (
            <div className="text-center py-8 text-dark-400">
                <p>{impactText.noEvents}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-dark-700 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">
                      {eventTypeLabels[event.type] || event.type}
                    </p>
                    <p className="text-sm text-dark-400">
                      {new Date(event.timestamp).toLocaleString(locale)}
                    </p>
                  </div>
                  <div className="text-accent-400 font-semibold">
                    +{event.weight.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Botões de Ação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex gap-4 justify-center"
      >
        <Button onClick={handleAttest} variant="accent" disabled={isAttesting} title={impactText.attestButton.tooltip}>
          <Shield className="w-4 h-4 mr-2" aria-hidden="true" />
          {isAttesting ? impactText.attestButton.loading : impactText.attestButton.label}
        </Button>
      </motion.div>

      {/* Modal de Criar Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              {impactText.modalTitle}
            </h3>
            
            <form onSubmit={handleCreateEvent} className="space-y-5">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    {impactText.typeLabel}
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-700 text-white rounded-lg border border-dark-600 focus:border-primary-500 focus:outline-none"
                    required
                  >
                    <option value="">{impactText.typePlaceholder}</option>
                    {eventOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-dark-300">
                      {impactText.importanceLabel}
                    </label>
                    <HelpCircle className="w-4 h-4 text-dark-400 cursor-help" title={impactText.importanceTooltip} aria-hidden="true" />
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step="1"
                    value={importance}
                    onChange={(e) => setImportance(e.target.value)}
                    placeholder={impactText.importancePlaceholder}
                    className="w-full px-4 py-2 bg-dark-700 text-white rounded-lg border border-dark-600 focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-300">{impactText.evidenceLabel}</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="w-full text-sm text-dark-200 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-500/20 file:px-4 file:py-2 file:text-primary-200"
                    onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                  />
                  <input
                    type="url"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder={impactText.evidencePlaceholder}
                    className="w-full px-4 py-2 bg-dark-700 text-white rounded-lg border border-dark-600 focus:border-primary-500 focus:outline-none"
                  />
                  <p className="text-xs text-dark-400">{impactText.evidenceHint}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">{impactText.observationLabel}</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={impactText.notesPlaceholder}
                    className="w-full px-4 py-2 bg-dark-700 text-white rounded-lg border border-dark-600 focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <details className="rounded-lg border border-white/10 p-3 bg-dark-800/80">
                  <summary className="cursor-pointer text-sm font-medium text-dark-200">
                    {impactText.advancedSummary}
                  </summary>
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-dark-400">{impactText.advancedHint}</p>
                    <label className="flex items-center gap-2 text-xs text-dark-300">
                      <input
                        type="checkbox"
                        checked={advancedEnabled}
                        onChange={(e) => setAdvancedEnabled(e.target.checked)}
                      />
                      {impactText.advancedToggle}
                    </label>
                    <textarea
                      value={advancedMetadata}
                      onChange={(e) => setAdvancedMetadata(e.target.value)}
                      placeholder={impactText.metadataPlaceholder}
                      rows={6}
                      className="w-full px-4 py-2 bg-dark-700 text-white rounded-lg border border-dark-600 focus:border-primary-500 focus:outline-none font-mono text-sm"
                      disabled={!advancedEnabled}
                    />
                  </div>
                </details>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  {impactText.cancelButton}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  {impactText.submitButton}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ImpactScore;


