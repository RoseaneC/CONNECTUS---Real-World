// [CONNECTUS PATCH] Modal para verificação de QR
import { useState } from 'react';
import { missionService } from '../../services/missionService';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

export const VerifyQrModal = ({ isOpen, onClose, onSuccess, mission }) => {
  const [qrCode, setQrCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!qrCode.trim()) {
      setError('Por favor, insira o código QR');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await missionService.verifyMissionQr(qrCode);
      onSuccess(result);
      setQrCode('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao verificar QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setQrCode('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Verificar QR Code</h2>
        <p className="text-gray-600 mb-4">
          {mission?.title}: {mission?.description}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código do QR
            </label>
            <Input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="Cole o código QR aqui"
              className="w-full"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm disabled:opacity-50"
            >
              {isLoading ? 'Verificando...' : 'Verificar'}
            </button>
          </div>
        </form>

        {/* TODO: Botão de escanear QR quando VITE_FEATURE_QR=true */}
        {import.meta.env.VITE_FEATURE_QR === 'true' && (
          <div className="mt-4 pt-4 border-t">
            <button
              className="w-full px-3 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 text-white text-sm"
              onClick={() => {
                // TODO: Implementar scanner QR
                alert('Scanner QR em desenvolvimento');
              }}
            >
              📷 Escanear QR (Beta)
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
