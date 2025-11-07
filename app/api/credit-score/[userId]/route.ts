export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const userId = Number.parseInt(params.userId)
  return Response.json({
    user_id: userId,
    credit_score: 650 + Math.random() * 100,
    stats: {
      total_tasks: 12,
      verified_tasks: 10,
      paid_tasks: 8,
      avg_score: 0.89,
    },
  })
}
