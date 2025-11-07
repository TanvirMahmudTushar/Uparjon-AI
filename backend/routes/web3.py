from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import CryptoWallet, NFTBadge
from database import get_db
from datetime import datetime

router = APIRouter(prefix="/web3", tags=["web3"])

@router.post("/wallet/connect")
async def connect_wallet(user_id: int, wallet_address: str, wallet_type: str, db: Session = Depends(get_db)):
    """Connect crypto wallet (MetaMask, WalletConnect)"""
    
    existing = db.query(CryptoWallet).filter(CryptoWallet.wallet_address == wallet_address).first()
    if existing:
        raise HTTPException(status_code=400, detail="Wallet already connected")
    
    wallet = CryptoWallet(
        user_id=user_id,
        wallet_address=wallet_address,
        wallet_type=wallet_type,
        balance=0
    )
    db.add(wallet)
    db.commit()
    
    return {"wallet_id": wallet.id, "wallet_address": wallet_address, "balance": 0}

@router.get("/wallet/{user_id}")
async def get_wallet(user_id: int, db: Session = Depends(get_db)):
    """Get wallet info and WPAY token balance"""
    wallet = db.query(CryptoWallet).filter(CryptoWallet.user_id == user_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    return {
        "wallet_address": wallet.wallet_address,
        "balance": wallet.balance,
        "balance_usd": wallet.balance * 0.45,  # Mock conversion rate
        "wallet_type": wallet_type
    }

@router.post("/nft/mint")
async def mint_nft_badge(user_id: int, badge_name: str, db: Session = Depends(get_db)):
    """Mint NFT badge achievement"""
    
    token_id = f"NFT_{user_id}_{badge_name}_{datetime.now().timestamp()}"
    
    nft = NFTBadge(
        user_id=user_id,
        badge_name=badge_name,
        token_id=token_id,
        metadata={
            "name": badge_name,
            "description": f"WorkPayAI Achievement: {badge_name}",
            "image": f"ipfs://QmNFT{badge_name}",
            "attributes": [
                {"trait_type": "Achievement", "value": badge_name},
                {"trait_type": "Minted", "value": datetime.now().isoformat()}
            ]
        }
    )
    db.add(nft)
    db.commit()
    
    return {
        "token_id": token_id,
        "badge_name": badge_name,
        "transaction": "0x123abc456def",
        "ipfs_link": f"ipfs://QmNFT{badge_name}"
    }

@router.get("/nft/{user_id}")
async def get_user_nfts(user_id: int, db: Session = Depends(get_db)):
    """Get all NFT badges owned by user"""
    nfts = db.query(NFTBadge).filter(NFTBadge.user_id == user_id).all()
    return [
        {
            "token_id": nft.token_id,
            "badge_name": nft.badge_name,
            "metadata": nft.metadata,
            "created_at": nft.created_at.isoformat()
        }
        for nft in nfts
    ]

@router.get("/rewards/{user_id}")
async def get_crypto_rewards(user_id: int, db: Session = Depends(get_db)):
    """Get crypto rewards summary"""
    return {
        "user_id": user_id,
        "wpay_earned": 150.5,
        "wpay_to_usd": 150.5 * 0.45,
        "pending_rewards": 25.0,
        "total_transactions": 12
    }
