export async function POST(request: Request) {
  const body = await request.json()
  return Response.json({
    id: Math.floor(Math.random() * 1000),
    ...body,
    verification_status: "pending",
    payment_status: "unpaid",
    ai_score: 0,
    created_at: new Date().toISOString(),
  })
}
