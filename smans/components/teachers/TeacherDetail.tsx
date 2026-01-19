// components/dashboard/teachers/components/TeacherDetail.tsx
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface Teacher {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  // add more fields as needed (phone, subjects, bio, etc.)
}

interface TeacherDetailProps {
  teacher: Teacher;
}

export default function TeacherDetail({ teacher }: TeacherDetailProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{teacher.name}</span>
            <Badge variant="outline" className="capitalize">
              {teacher.role}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="mt-1">{teacher.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Joined On</dt>
                  <dd className="mt-1">
                    {new Date(teacher.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              </dl>
            </div>

            {/* You can add more sections here */}
            {/* e.g. Classes Taught, Recent Activity, Stats */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}