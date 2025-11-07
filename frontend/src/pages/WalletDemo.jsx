import { motion } from 'framer-motion';
import { Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import WalletPanel from '../components/wallet/WalletPanel';
import StakePanel from '../components/wallet/StakePanel';
import { WEB3_CONFIG } from '@/web3/addresses';

const WalletDemo = () => {
  const isDemo = WEB3_CONFIG.DEMO_MODE;
  const showRealModeWarning = !isDemo && !WEB3_CONFIG.isConfigured;
  const cfgDump = JSON.stringify(WEB3_CONFIG, null, 2);
  const title = `Carteira VEXA${isDemo ? ' (modo demo)' : ''}`;

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
                Defina VITE_SEPOLIA_TOKEN_ADDRESS e VITE_SEPOLIA_TOKENSHOP_ADDRESS em frontend/.env.local e confirme que VITE_WEB3_DEMO_MODE=false.
              </p>
              <pre className="mt-2 text-xs text-red-200/80 bg-red-500/10 rounded p-3 overflow-auto">{cfgDump}</pre>
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
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-dark-400">
            Gerencie suas moedas e missões simuladas.
            <span className="block text-sm opacity-70">Manage your simulated wallet and tokens.</span>
          </p>
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

