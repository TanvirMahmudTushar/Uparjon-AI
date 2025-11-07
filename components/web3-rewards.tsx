"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CryptoReward {
  id: number
  token_type: string
  amount: number
  wallet_address: string
  transaction_hash: string
  status: string
  created_at: string
}

interface NFTBadge {
  id: number
  badge_id: string
  token_id: string
  contract_address: string
  minted_at: string
}

export function Web3Rewards({ userId }: { userId: number }) {
  const [rewards, setRewards] = useState<CryptoReward[]>([])
  const [nftBadges, setNftBadges] = useState<NFTBadge[]>([])
  const [walletAddress, setWalletAddress] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    try {
      const [rewRes, nftRes] = await Promise.all([
        fetch(`/api/crypto-rewards?userId=${userId}`),
        fetch(`/api/nft-badges/mint?userId=${userId}`),
      ])

      const rewards = await rewRes.json()
      const badges = await nftRes.json()

      setRewards(rewards)
      setNftBadges(badges)
    } catch (error) {
      console.error("Failed to fetch Web3 data:", error)
    }
  }

  const claimReward = async () => {
    if (!walletAddress) {
      alert("Please enter a wallet address")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/crypto-rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          tokenType: "WPAY",
          amount: 100,
          walletAddress,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Reward claimed! Transaction: ${data.transactionHash}`)
        fetchData()
        setWalletAddress("")
      }
    } catch (error) {
      console.error("Failed to claim reward:", error)
    } finally {
      setLoading(false)
    }
  }

  const mintNFT = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/nft-badges/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          badgeId: "achievement_" + Math.random().toString(36).substr(2, 9),
          metadata: {
            name: "Uparjon AI Achievement",
            description: "Earned through exceptional performance",
            image: "ipfs://QmXxxx",
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`NFT Minted! Token ID: ${data.tokenId}`)
        fetchData()
      }
    } catch (error) {
      console.error("Failed to mint NFT:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Crypto Rewards</CardTitle>
            <CardDescription>Earn WPAY tokens for achievements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-background p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
              <p className="text-3xl font-bold text-primary">500 WPAY</p>
              <p className="text-xs text-muted-foreground mt-1">≈ $250 USD</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Wallet Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded text-foreground text-sm"
              />
            </div>

            <Button onClick={claimReward} disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? "Processing..." : "Claim Rewards"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-accent/20">
          <CardHeader>
            <CardTitle className="text-accent">NFT Badges</CardTitle>
            <CardDescription>Collectible achievement NFTs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Master", rarity: "Legendary" },
                { name: "Expert", rarity: "Epic" },
                { name: "Pro", rarity: "Rare" },
                { name: "Starter", rarity: "Common" },
              ].map((badge, idx) => (
                <div key={idx} className="p-3 bg-background rounded border border-border text-center">
                  <p className="text-sm font-semibold text-foreground">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.rarity}</p>
                </div>
              ))}
            </div>

            <Button onClick={mintNFT} disabled={loading} className="w-full bg-accent hover:bg-accent/90">
              {loading ? "Minting..." : "Mint Achievement NFT"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {rewards.map((reward) => (
              <div key={reward.id} className="p-3 bg-background rounded border border-border text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">{reward.token_type}</span>
                  <Badge className="bg-green-500">{reward.amount} tokens</Badge>
                </div>
                <p className="text-xs text-muted-foreground break-all">TX: {reward.transaction_hash}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(reward.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle>Your NFT Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nftBadges.map((badge) => (
              <div key={badge.id} className="p-4 bg-background rounded border border-primary/50">
                <div className="aspect-square bg-gradient-to-br from-primary to-accent rounded mb-3 flex items-center justify-center">
                  <span className="text-4xl">🏆</span>
                </div>
                <p className="font-semibold text-foreground text-sm">Achievement NFT</p>
                <p className="text-xs text-muted-foreground mt-1 break-all">ID: {badge.token_id}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
