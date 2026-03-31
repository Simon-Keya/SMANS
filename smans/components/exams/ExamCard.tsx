// components/exams/AssessmentCard.tsx
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Edit, Eye, Trash2 } from "lucide-react";
import Link from "next/link";

interface Assessment {
  id: string;
  title: string;
  learningArea: { name: string };     // Changed from subject
  class: { name: string };
  date: Date;
  status: string;
  performanceLevel?: string;          // CBC-specific
}

interface AssessmentCardProps {
  assessment: Assessment;
  onDelete?: (id: string) => void;
}

export default function AssessmentCard({ assessment, onDelete }: AssessmentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow bg-base-100 border-base-200">
      <CardHeader>
        <CardTitle className="text-lg text-primary">{assessment.title}</CardTitle>
        <div className="flex gap-2 mt-1">
          <Badge variant="outline" className="capitalize">
            {assessment.status}
          </Badge>
          {assessment.performanceLevel && (
            <Badge variant="secondary" className="capitalize">
              {assessment.performanceLevel}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1 text-sm">
          <p><strong>Learning Area:</strong> {assessment.learningArea?.name ?? "—"}</p>
          <p><strong>Class:</strong> {assessment.class?.name ?? "—"}</p>
          <p><strong>Date:</strong> {new Date(assessment.date).toLocaleDateString()}</p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/exams/${assessment.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/exams/${assessment.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>

          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(assessment.id)}
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