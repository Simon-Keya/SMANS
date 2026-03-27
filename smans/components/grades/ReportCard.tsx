// components/reports/ReportCard.tsx
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface ReportCardProps {
  studentName: string;
  rollNumber: string;           // Changed to match your schema
  className: string;
  term: string;
  year: number;
  grades: Array<{
    subject: string;
    marks: number;
    maxMarks: number;
    assessmentType?: string;
    competencyLevel?: string;
    remarks?: string;
  }>;
  overallPercentage: number;
  overallGrade: string;
  overallCompetency?: string;   // CBC-specific
  remarks?: string;
  generatedBy?: string;
}

export default function ReportCard({
  studentName,
  rollNumber,
  className,
  term,
  year,
  grades,
  overallPercentage,
  overallGrade,
  overallCompetency,
  remarks,
  generatedBy,
}: ReportCardProps) {
  const getCompetencyBadge = (level?: string) => {
    if (!level) return null;

    const colorMap: Record<string, string> = {
      EXCEEDING_EXPECTATIONS: "bg-green-100 text-green-800 border-green-300",
      MEETING_EXPECTATIONS: "bg-blue-100 text-blue-800 border-blue-300",
      APPROACHING_EXPECTATIONS: "bg-yellow-100 text-yellow-800 border-yellow-300",
      BELOW_EXPECTATIONS: "bg-red-100 text-red-800 border-red-300",
    };

    return (
      <Badge variant="outline" className={colorMap[level] || ""}>
        {level.replace(/_/g, " ")}
      </Badge>
    );
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-lg">
      <CardHeader className="text-center border-b pb-6">
        <CardTitle className="text-3xl font-bold text-primary">
          Learner Progress Report
        </CardTitle>
        <p className="text-lg mt-1">
          {term} • Academic Year {year} - {year + 1}
        </p>
      </CardHeader>

      <CardContent className="pt-8 space-y-8">
        {/* Student Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Learner Name</p>
            <p className="font-semibold text-lg">{studentName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Roll Number</p>
            <p className="font-semibold">{rollNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Class</p>
            <p className="font-semibold">{className}</p>
          </div>
        </div>

        {/* Grades Table */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Learning Areas Performance</h3>
          
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium">Learning Area</th>
                  <th className="text-right p-4 font-medium">Marks</th>
                  <th className="text-right p-4 font-medium">Out of</th>
                  <th className="text-right p-4 font-medium">Percentage</th>
                  <th className="text-right p-4 font-medium">Competency</th>
                  <th className="text-right p-4 font-medium">Grade</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g, index) => {
                  const percentage = g.maxMarks > 0 ? (g.marks / g.maxMarks) * 100 : 0;
                  return (
                    <tr key={index} className="border-t hover:bg-muted/50">
                      <td className="p-4 font-medium">{g.subject}</td>
                      <td className="p-4 text-right">{g.marks}</td>
                      <td className="p-4 text-right">{g.maxMarks}</td>
                      <td className="p-4 text-right font-medium">
                        {percentage.toFixed(1)}%
                      </td>
                      <td className="p-4 text-right">
                        {getCompetencyBadge(g.competencyLevel)}
                      </td>
                      <td className="p-4 text-right">
                        <Badge variant={percentage >= 50 ? "default" : "destructive"}>
                          {g.competencyLevel ? 
                            g.competencyLevel.replace(/_/g, " ") : 
                            `${percentage.toFixed(0)}%`}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overall Performance */}
        <div className="pt-6 border-t">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">
              Overall: {overallPercentage.toFixed(1)}%
            </p>
            <p className="text-xl mt-1">
              {overallGrade}
              {overallCompetency && (
                <span className="ml-3 text-base font-normal text-muted-foreground">
                  • {overallCompetency.replace(/_/g, " ")}
                </span>
              )}
            </p>
          </div>

          {remarks && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-1">Teacher’s Remarks</p>
              <p className="italic">{remarks}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-6 border-t">
          Generated on {new Date().toLocaleDateString()} • 
          {generatedBy && ` by ${generatedBy}`}
        </div>
      </CardContent>
    </Card>
  );
}