import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Name:</strong> {session?.user?.name}
          </div>
          <div>
            <strong>Email:</strong> {session?.user?.email}
          </div>
          <div>
            <strong>Role:</strong> {session?.user?.role}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}