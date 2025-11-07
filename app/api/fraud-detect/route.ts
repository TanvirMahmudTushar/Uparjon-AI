export async function POST(request: Request) {
  const body = await request.json()
  const fraudRisk = Math.random() * 0.3 // Low risk for demo
  return Response.json({
    user_id: body.user_id,
    fraud_analysis: {
      fraud_risk: fraudRisk,
      red_flags: fraudRisk > 0.2 ? ["Unusual activity pattern"] : [],
      anomalies: fraudRisk > 0.15 ? ["Multiple rapid transactions"] : [],
      confidence: 0.95,
    },
  })
}
