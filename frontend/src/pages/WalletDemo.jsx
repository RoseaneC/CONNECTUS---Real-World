import { motion } from 'framer-motion';
import { Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import WalletPanel from '../components/wallet/WalletPanel';
import StakePanel from '../components/wallet/StakePanel';

const WalletDemo = () => {
  const isDemo = import.meta.env?.VITE_WEB3_DEMO_MODE === 'true';
  const contractAddress = import.meta.env?.VITE_CONTRACT_ADDRESS;
  const showRealModeWarning = !isDemo && !contractAddress;

  return (
    <div className="space-y-6">
      {/* Banner Demo */}
      {isDemo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-yellow-400 font-medium">Modo Demo Ativado</p>
              <p className="text-yellow-300/80 text-sm">
                Esta demonstração não executa transações on-chain. Assim que o contrato VEXA estiver disponível, habilite o modo real nas variáveis de ambiente.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Warning Real Mode */}
      {showRealModeWarning && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-red-400 font-medium">Configuração Web3 Real Incompleta</p>
              <p className="text-red-300/80 text-sm">
                Defina VITE_CONTRACT_ADDRESS em .env.local ou use VITE_WEB3_DEMO_MODE=true para demonstrar.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Carteira VEXA</h1>
          <p className="text-dark-400">Gerencie seus tokens e stakes</p>
        </div>
      </motion.div>

      {/* Wallet Panel */}
      <WalletPanel />

      {/* Staking Panel */}
      <StakePanel />
    </div>
  );
};

export default WalletDemo;

