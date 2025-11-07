export async function POST(request: Request) {
  const body = await request.json()
  return Response.json({
    task_id: body.task_id,
    verification_status: "verified",
    ai_score: 0.85 + Math.random() * 0.15,
    authenticity: 0.92,
    plagiarism_score: 0.05,
    time_anomaly: false,
    message: "Task verified successfully",
  })
}
