import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface ReportCardProps {
  studentName: string;
  className: string;
  examName: string;
  grades: { subject: string; marks: number; grade: string }[];
  overallPercentage: number;
  overallGrade: string;
  remarks?: string;
}

export default function ReportCard({
  studentName,
  className,
  examName,
  grades,
  overallPercentage,
  overallGrade,
  remarks,
}: ReportCardProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center border-b">
        <CardTitle className="text-2xl">Report Card</CardTitle>
        <p className="text-lg">{examName}</p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Student:</strong> {studentName}
          </div>
          <div>
            <strong>Class:</strong> {className}
          </div>
        </div>

        <div className="space-y-2">
          {grades.map((g) => (
            <div key={g.subject} className="flex justify-between items-center py-2 border-b last:border-0">
              <span className="font-medium">{g.subject}</span>
              <div className="flex items-center gap-4">
                <span>{g.marks} marks</span>
                <Badge>{g.grade}</Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-6 border-t">
          <p className="text-2xl font-bold">
            Overall: {overallPercentage.toFixed(1)}% - {overallGrade}
          </p>
          {remarks && <p className="mt-4 italic text-muted-foreground">{remarks}</p>}
        </div>
      </CardContent>
    </Card>
  );
}