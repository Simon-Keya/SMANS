// components/subjects/SubjectCard.tsx
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Edit, Eye, Trash2 } from "lucide-react";
import Link from "next/link";

interface Subject {
  id: string;
  name: string;
  code: string;
  teacherName?: string | null;
  classCount?: number;
}

interface SubjectCardProps {
  subject: Subject;
  onDelete?: (id: string) => void;
}

export default function SubjectCard({ subject, onDelete }: SubjectCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow bg-base-100 border-base-200">
      <CardHeader>
        <CardTitle className="text-lg text-primary">{subject.name}</CardTitle>
        <Badge variant="outline" className="mt-1">
          {subject.code}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1 text-sm">
          <p><strong>Teacher:</strong> {subject.teacherName ?? "Not assigned"}</p>
          <p><strong>Classes using it:</strong> {subject.classCount ?? 0}</p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/subjects/${subject.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/subjects/${subject.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>

          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(subject.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}