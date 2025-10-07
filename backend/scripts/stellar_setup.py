import logging
from stellar_sdk import Server, Keypair, Network, TransactionBuilder, Asset
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_stellar():
    try:
        logger.info("=== CONFIGURAÇÃO STELLAR CONNECTUS ===")

        # Inicializa servidor Stellar
        server = Server(horizon_url=settings.stellar_horizon_url)
        network_passphrase = Network.TESTNET_NETWORK_PASSPHRASE  # Alteração para v13

        # Gera uma nova conta Stellar para emissão de tokens
        issuer_keypair = Keypair.random()
        issuer_public = issuer_keypair.public_key
        issuer_secret = issuer_keypair.secret
        settings.stellar_issuer_account = issuer_public

        logger.info(f"Issuer Public Key: {issuer_public}")
        logger.info(f"Issuer Secret Key: {issuer_secret}")

        # Testnet funding via Friendbot
        import requests
        response = requests.get(f"https://friendbot.stellar.org/?addr={issuer_public}")
        if response.status_code == 200:
            logger.info("Conta criada e financiada na Testnet com sucesso!")
        else:
            logger.error("Erro ao financiar a conta na Testnet.")

        # Exemplo: cria um token customizado chamado "CONNECT"
        asset = Asset("CONNECT", issuer_public)
        logger.info(f"Token CONNECT criado com issuer {issuer_public}")

        return {
            "issuer_public": issuer_public,
            "issuer_secret": issuer_secret,
            "asset_code": asset.code
        }

    except Exception as e:
        logger.error(f"Erro durante configuração: {e}")
        logger.error("Falha na configuração Stellar")
        return None

if __name__ == "__main__":
    setup_stellar()






