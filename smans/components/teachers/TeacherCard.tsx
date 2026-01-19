// components/dashboard/teachers/components/TeacherCard.tsx
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Edit, Eye, Trash2 } from "lucide-react";
import Link from "next/link";

interface Teacher {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

interface TeacherCardProps {
  teacher: Teacher;
  onDelete?: (id: string) => void;
}

export default function TeacherCard({ teacher, onDelete }: TeacherCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{teacher.name}</CardTitle>
          <Badge variant="outline" className="capitalize">
            {teacher.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">
            <strong>Email:</strong> {teacher.email}
          </p>
          <p className="text-muted-foreground">
            <strong>Joined:</strong> {new Date(teacher.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/teachers/${teacher.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/teachers/${teacher.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>

          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(teacher.id)}
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