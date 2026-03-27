// components/grades/GradeTable.tsx
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

interface Grade {
  subject: string;
  marks: number;
  maxMarks: number;
  assessmentType?: string;
  competencyLevel?: string;
  remarks?: string;
}

interface GradeTableProps {
  grades: Grade[];
  showCompetency?: boolean;
}

const getCompetencyBadge = (level?: string) => {
  if (!level) return <Badge variant="secondary">N/A</Badge>;

  const colors: Record<string, string> = {
    EXCEEDING_EXPECTATIONS: "bg-green-100 text-green-800",
    MEETING_EXPECTATIONS: "bg-blue-100 text-blue-800",
    APPROACHING_EXPECTATIONS: "bg-yellow-100 text-yellow-800",
    BELOW_EXPECTATIONS: "bg-red-100 text-red-800",
  };

  return (
    <Badge className={colors[level] || ""}>
      {level.replace(/_/g, " ")}
    </Badge>
  );
};

export default function GradeTable({ grades, showCompetency = true }: GradeTableProps) {
  const totalMarks = grades.reduce((sum, g) => sum + g.marks, 0);
  const totalMax = grades.reduce((sum, g) => sum + g.maxMarks, 0);
  const overallPercentage = totalMax > 0 ? (totalMarks / totalMax) * 100 : 0;

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 80) return "A";
    if (percentage >= 65) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "E";
  };

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Learning Area</TableHead>
            <TableHead className="text-right">Marks</TableHead>
            <TableHead className="text-right">Out Of</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
            {showCompetency && <TableHead className="text-right">Competency</TableHead>}
            <TableHead className="text-right">Grade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grades.map((grade, index) => {
            const percentage = (grade.marks / grade.maxMarks) * 100;

            return (
              <TableRow key={index}>
                <TableCell className="font-medium">{grade.subject}</TableCell>
                <TableCell className="text-right">{grade.marks}</TableCell>
                <TableCell className="text-right">{grade.maxMarks}</TableCell>
                <TableCell className="text-right font-medium">
                  {percentage.toFixed(1)}%
                </TableCell>
                {showCompetency && (
                  <TableCell className="text-right">
                    {getCompetencyBadge(grade.competencyLevel)}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <Badge variant={percentage >= 50 ? "default" : "destructive"}>
                    {getGradeLetter(percentage)}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="mt-6 p-5 bg-muted rounded-lg text-center border">
        <p className="text-xl font-bold">
          Overall Performance: {overallPercentage.toFixed(1)}% — {getGradeLetter(overallPercentage)}
        </p>
      </div>
    </div>
  );
}