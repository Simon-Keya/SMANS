import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Calendar, Mail, Phone } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  createdAt: Date;
  // Add more fields as your schema evolves
}

interface TeacherDetailProps {
  teacher: Teacher;
}

export default function TeacherDetail({ teacher }: TeacherDetailProps) {
  return (
    <div className="space-y-6">
      <Card className="border-base-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-xl">
            {teacher.name}
            <Badge variant="outline" className="capitalize">
              {teacher.role}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <dl className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                      <dd className="mt-1">{teacher.email}</dd>
                    </div>
                  </div>

                  {teacher.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                        <dd className="mt-1">{teacher.phone}</dd>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
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
                  </div>
                </dl>
              </div>
            </div>

            {/* Add more sections later */}
            {/* e.g. Classes Taught, Recent Activity, Stats */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <p className="text-sm text-muted-foreground">
                More details (subjects, bio, etc.) will appear here as you expand the teacher profile.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}