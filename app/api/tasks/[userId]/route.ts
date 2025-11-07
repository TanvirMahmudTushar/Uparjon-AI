export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const userId = Number.parseInt(params.userId)
  const tasks = [
    {
      id: 1,
      user_id: userId,
      description: "Completed data entry project",
      amount: 50,
      verification_status: "verified",
      payment_status: "paid",
      ai_score: 0.95,
      created_at: "2025-10-20",
    },
    {
      id: 2,
      user_id: userId,
      description: "Translated document from English to Bengali",
      amount: 75,
      verification_status: "verified",
      payment_status: "unpaid",
      ai_score: 0.88,
      created_at: "2025-10-25",
    },
    {
      id: 3,
      user_id: userId,
      description: "Content writing for blog post",
      amount: 100,
      verification_status: "pending",
      payment_status: "unpaid",
      ai_score: 0,
      created_at: "2025-10-28",
    },
  ]
  return Response.json(tasks)
}
