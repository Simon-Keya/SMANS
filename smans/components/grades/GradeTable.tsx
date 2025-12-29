import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

interface Grade {
  subject: string;
  marks: number;
  maxMarks: number;
  grade?: string;
}

interface GradeTableProps {
  grades: Grade[];
}

const getGradeLetter = (percentage: number) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
};

export default function GradeTable({ grades }: GradeTableProps) {
  const totalMarks = grades.reduce((sum, g) => sum + g.marks, 0);
  const totalMax = grades.reduce((sum, g) => sum + g.maxMarks, 0);
  const percentage = totalMax > 0 ? (totalMarks / totalMax) * 100 : 0;

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead className="text-right">Marks</TableHead>
            <TableHead className="text-right">Out Of</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
            <TableHead className="text-right">Grade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grades.map((grade) => {
            const perc = (grade.marks / grade.maxMarks) * 100;
            return (
              <TableRow key={grade.subject}>
                <TableCell className="font-medium">{grade.subject}</TableCell>
                <TableCell className="text-right">{grade.marks}</TableCell>
                <TableCell className="text-right">{grade.maxMarks}</TableCell>
                <TableCell className="text-right">{perc.toFixed(1)}%</TableCell>
                <TableCell className="text-right">
                  <Badge variant={perc >= 60 ? "default" : "destructive"}>{getGradeLetter(perc)}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="mt-6 p-4 bg-muted rounded-lg text-center">
        <p className="text-lg font-semibold">
          Overall: {percentage.toFixed(2)}% - {getGradeLetter(percentage)}
        </p>
      </div>
    </div>
  );
}