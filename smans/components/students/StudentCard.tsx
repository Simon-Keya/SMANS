import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Mail, Phone, User } from "lucide-react";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  email?: string | null;
  phone?: string | null;
  parentName?: string | null;
  parentPhone?: string | null;
}

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{student.name}</CardTitle>
            <p className="text-sm text-muted-foreground">Roll: {student.rollNumber}</p>
          </div>
          <Badge variant="secondary">Class {student.class}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm">
          {student.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{student.email}</span>
            </div>
          )}

          {student.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{student.phone}</span>
            </div>
          )}
        </div>

        {(student.parentName || student.parentPhone) && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium flex items-center gap-2 mb-2">
              <User className="h-4 w-4" />
              Parent/Guardian
            </p>
            {student.parentName && <p className="text-sm text-muted-foreground">{student.parentName}</p>}
            {student.parentPhone && <p className="text-sm text-muted-foreground">{student.parentPhone}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}