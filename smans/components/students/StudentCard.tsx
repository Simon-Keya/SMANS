// components/students/StudentCard.tsx
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Hash, Mail, Phone, User } from "lucide-react";

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
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
    <Card className="hover:shadow-md transition-shadow bg-base-100 border border-base-200">
      <CardHeader>
        <div className="flex justify-between items-start gap-3">
          <div>
            <CardTitle className="text-lg text-base-content">
              {student.name}
            </CardTitle>
            <p className="text-sm text-base-content/60 flex items-center gap-1 mt-0.5">
              <Hash className="h-3.5 w-3.5" />
              Adm: {student.admissionNumber}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            Class {student.class}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm">
          {student.email && (
            <div className="flex items-center gap-2 text-base-content/80">
              <Mail className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{student.email}</span>
            </div>
          )}

          {student.phone && (
            <div className="flex items-center gap-2 text-base-content/80">
              <Phone className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{student.phone}</span>
            </div>
          )}
        </div>

        {(student.parentName || student.parentPhone) && (
          <div className="pt-4 border-t border-base-200">
            <p className="text-sm font-medium flex items-center gap-2 mb-2 text-base-content">
              <User className="h-4 w-4 text-primary" />
              Parent / Guardian
            </p>
            {student.parentName && (
              <p className="text-sm text-base-content/60">{student.parentName}</p>
            )}
            {student.parentPhone && (
              <p className="text-sm text-base-content/60">{student.parentPhone}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}