import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Mail, Phone, User } from "lucide-react";

interface Student {
  name: string;
  rollNumber: string;
  class: string;
  email?: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
}

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{student.name}</CardTitle>
            <p className="text-sm text-muted-foreground">Roll: {student.rollNumber}</p>
          </div>
          <Badge variant="secondary">Class {student.class}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {student.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{student.email}</span>
          </div>
        )}
        {student.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{student.phone}</span>
          </div>
        )}
        {(student.parentName || student.parentPhone) && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium flex items-center gap-2">
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