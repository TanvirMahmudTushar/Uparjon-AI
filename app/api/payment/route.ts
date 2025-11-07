export async function POST(request: Request) {
  const body = await request.json()
  return Response.json({
    task_id: body.task_id,
    payment_status: "paid",
    amount: 50,
    method: "bKash",
    transaction_id: `TXN-${Date.now()}`,
    timestamp: new Date().toISOString(),
  })
}
