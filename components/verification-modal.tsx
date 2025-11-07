"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader } from "lucide-react"

interface VerificationModalProps {
  isOpen: boolean
  result?: any
  isLoading?: boolean
  onClose: () => void
}

export function VerificationModal({ isOpen, result, isLoading = false, onClose }: VerificationModalProps) {
  const [displayResult, setDisplayResult] = useState<any>(null)

  useEffect(() => {
    if (result) {
      setDisplayResult(result)
    }
  }, [result])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
      <Card className="bg-card border-border p-8 max-w-md w-full mx-4 animate-in slide-in-from-bottom-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-foreground font-medium">Verifying task...</p>
            <p className="text-foreground/60 text-sm mt-2">Our AI is analyzing your submission</p>
          </div>
        ) : displayResult ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              {displayResult.verification_result?.authenticity_score > 0.7 ? (
                <CheckCircle className="w-16 h-16 text-success" />
              ) : (
                <AlertCircle className="w-16 h-16 text-warning" />
              )}
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {displayResult.status === "verified" ? "Verified!" : "Review Needed"}
              </h2>
              <p className="text-foreground/60">
                {displayResult.status === "verified"
                  ? "Your task has been verified successfully"
                  : "Your task needs manual review"}
              </p>
            </div>

            <div className="bg-background rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-foreground/60">Authenticity Score</span>
                <span className="text-primary font-bold">
                  {(displayResult.verification_result?.authenticity_score * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Fraud Risk</span>
                <span className="text-warning font-bold">
                  {(displayResult.verification_result?.fraud_risk * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {displayResult.verification_result?.red_flags?.length > 0 && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                <p className="text-sm font-medium text-warning mb-2">Red Flags Detected:</p>
                <ul className="text-sm text-foreground/80 space-y-1">
                  {displayResult.verification_result.red_flags.map((flag: string, idx: number) => (
                    <li key={idx}>• {flag}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full bg-primary text-background hover:bg-primary-dark py-2 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
