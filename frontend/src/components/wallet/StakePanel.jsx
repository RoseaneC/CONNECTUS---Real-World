import { useState, useEffect } from 'react';
import { Lock, Unlock, TrendingUp, Plus, Calendar } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { getWalletProvider } from '../../web3/provider';

const StakePanel = () => {
  const [positions, setPositions] = useState([]);
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState('30');
  const [loading, setLoading] = useState(false);
  const [staking, setStaking] = useState(false);
  const provider = getWalletProvider();

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    setLoading(true);
    try {
      const data = await provider.getPositions();
      setPositions(data || []);
    } catch (error) {
      console.error('Load positions failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Valor inválido');
      return;
    }

    setStaking(true);
    try {
      const result = await provider.stake(parseFloat(amount), parseInt(days));
      if (result.success) {
        await loadPositions();
        alert(`✅ Stake criado! ${result.amount} tokens por ${result.days} dias`);
        setAmount('');
      } else {
        alert(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      alert('Erro ao criar stake');
    } finally {
      setStaking(false);
    }
  };

  const handleUnstake = async (positionId) => {
    if (!confirm('Confirmar liberação do stake?')) return;

    setLoading(true);
    try {
      const result = await provider.unstake(positionId);
      if (result.success) {
        await loadPositions();
        alert(`✅ ${result.returned} tokens liberados!`);
      } else {
        alert(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      alert('Erro ao liberar stake');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Staking</h3>
            <p className="text-dark-400 text-sm">Bloqueie tokens e ganhe recompensas</p>
          </div>
        </div>
      </div>

      {/* Criar Stake */}
      <div className="bg-dark-700/50 rounded-lg p-4 mb-4">
        <h4 className="text-white mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Criar novo stake
        </h4>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Input
            type="number"
            placeholder="Quantidade"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Dias"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </div>
        <Button onClick={handleStake} disabled={staking || loading}>
          {staking ? 'Criando...' : 'Criar Stake'}
        </Button>
      </div>

      {/* Lista de Posições */}
      {loading ? (
        <div className="text-center py-8 text-dark-400">Carregando...</div>
      ) : positions.length === 0 ? (
        <div className="text-center py-8 text-dark-400">
          <Lock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum stake ativo</p>
        </div>
      ) : (
        <div className="space-y-3">
          {positions.map((pos) => (
            <div key={pos.id} className="bg-dark-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {pos.status === 'locked' ? (
                    <Lock className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Unlock className="w-5 h-5 text-green-400" />
                  )}
                  <div>
                    <p className="text-white font-medium">{pos.amount} VEXA</p>
                    <p className="text-dark-400 text-sm">
                      {pos.days} dias @ {pos.apr}% APR
                    </p>
                    {pos.unlock_at && (
                      <p className="text-dark-400 text-xs mt-1">
                        Libera: {new Date(pos.unlock_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                {pos.status === 'locked' && (
                  <Button
                    size="sm"
                    onClick={() => handleUnstake(pos.id)}
                    variant="outline"
                  >
                    Liberar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default StakePanel;

