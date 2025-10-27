import { useState, useEffect } from 'react';
import { Wallet, Coins, RefreshCw } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { getWalletProvider } from '../../web3/provider';

const WalletPanel = () => {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const provider = getWalletProvider();
  const isDemo = provider.isDemo;

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    setLoading(true);
    try {
      const result = await provider.connect();
      if (result.success) {
        setAddress(result.address);
        setBalance(result.balance || 0);
      }
    } catch (error) {
      console.error('Wallet load failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    setMinting(true);
    try {
      const result = await provider.mint(100);
      if (result.success) {
        await loadWallet();
        alert(`✅ ${result.minted} tokens recebidos!`);
      } else {
        alert(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      alert('Erro ao receber tokens');
    } finally {
      setMinting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {isDemo && <span className="px-2 py-0.5 bg-yellow-500 text-xs rounded">DEMO</span>}
              Carteira
            </h3>
            <p className="text-dark-400 text-sm">Tokens VEXA</p>
          </div>
        </div>
        <Button onClick={handleMint} disabled={minting || loading}>
          {minting ? 'Mintando...' : 'Receber tokens demo'}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary-400" />
        </div>
      ) : (
        <>
          <div className="bg-dark-700/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Endereço:</span>
              <span className="text-white font-mono text-sm">{address}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Coins className="w-6 h-6 text-white" />
              <div>
                <p className="text-white/80 text-sm">Saldo</p>
                <p className="text-white text-2xl font-bold">{balance.toFixed(2)} VEXA</p>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default WalletPanel;

