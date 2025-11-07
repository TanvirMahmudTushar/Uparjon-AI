export async function GET(request: Request, { params }: { params: { id: string } }) {
  const userId = Number.parseInt(params.id)
  const users: Record<number, any> = {
    1: { id: 1, name: "Ahmed Hassan", credit_score: 650, email: "ahmed@example.com" },
    2: { id: 2, name: "Fatima Khan", credit_score: 720, email: "fatima@example.com" },
    3: { id: 3, name: "Karim Ali", credit_score: 580, email: "karim@example.com" },
    4: { id: 4, name: "Zainab Malik", credit_score: 690, email: "zainab@example.com" },
  }
  return Response.json(users[userId] || { error: "User not found" })
}
