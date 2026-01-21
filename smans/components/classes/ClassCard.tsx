// components/classes/ClassCard.tsx
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Edit, Eye, Trash2 } from "lucide-react";
import Link from "next/link";

interface Class {
  id: string;
  name: string;
  level: string;
  teacher?: { name: string } | null;
  studentCount: number;
}

interface ClassCardProps {
  classData: Class;
  onDelete?: (id: string) => void;
}

export default function ClassCard({ classData, onDelete }: ClassCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow bg-base-100 border-base-200">
      <CardHeader>
        <CardTitle className="text-lg text-primary">{classData.name}</CardTitle>
        <Badge variant="outline" className="mt-1">
          {classData.level}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1 text-sm">
          <p><strong>Teacher:</strong> {classData.teacher?.name ?? "Not assigned"}</p>
          <p><strong>Students:</strong> {classData.studentCount}</p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/classes/${classData.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/classes/${classData.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>

          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(classData.id)}
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