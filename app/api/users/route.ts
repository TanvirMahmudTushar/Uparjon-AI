export async function GET() {
  const users = [
    { id: 1, name: "Ahmed Hassan", credit_score: 650 },
    { id: 2, name: "Fatima Khan", credit_score: 720 },
    { id: 3, name: "Karim Ali", credit_score: 580 },
    { id: 4, name: "Zainab Malik", credit_score: 690 },
  ]
  return Response.json(users)
}
