// components/reports/ReportCard.tsx
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface ReportCardProps {
  studentName: string;
  admissionNumber: string;        // ← Changed from rollNumber
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
  overallCompetency?: string;
  remarks?: string;
  generatedBy?: string;
}

export default function ReportCard({
  studentName,
  admissionNumber,
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
    <Card className="max-w-4xl mx-auto shadow-xl">
      <CardHeader className="text-center border-b pb-8 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-4xl font-bold text-primary tracking-tight">
          Learner Progress Report (CBC)
        </CardTitle>
        <p className="text-xl mt-2 text-muted-foreground">
          {term.replace("_", " ")} • Academic Year {year} - {year + 1}
        </p>
      </CardHeader>

      <CardContent className="pt-10 space-y-10">
        {/* Student Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-widest">Learner Name</p>
            <p className="font-semibold text-2xl mt-1">{studentName}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-widest">Admission Number</p>
            <p className="font-semibold text-xl mt-1">{admissionNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-widest">Class</p>
            <p className="font-semibold text-xl mt-1">{className}</p>
          </div>
        </div>

        {/* Grades Table - CBC Style */}
        <div>
          <h3 className="font-semibold text-2xl mb-4">Learning Areas Performance</h3>
          
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-5 font-medium">Learning Area</th>
                  <th className="text-right p-5 font-medium">Score</th>
                  <th className="text-right p-5 font-medium">Out of</th>
                  <th className="text-right p-5 font-medium">Percentage</th>
                  <th className="text-center p-5 font-medium">Competency Level</th>
                  <th className="text-center p-5 font-medium">Grade</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g, index) => {
                  const percentage = g.maxMarks > 0 ? (g.marks / g.maxMarks) * 100 : 0;
                  return (
                    <tr key={index} className="border-t hover:bg-muted/50 transition-colors">
                      <td className="p-5 font-medium">{g.subject}</td>
                      <td className="p-5 text-right font-mono">{g.marks}</td>
                      <td className="p-5 text-right font-mono">{g.maxMarks}</td>
                      <td className="p-5 text-right font-semibold">
                        {percentage.toFixed(1)}%
                      </td>
                      <td className="p-5 text-center">
                        {getCompetencyBadge(g.competencyLevel)}
                      </td>
                      <td className="p-5 text-center">
                        <Badge 
                          variant={percentage >= 50 ? "default" : "destructive"}
                          className="font-medium"
                        >
                          {g.competencyLevel 
                            ? g.competencyLevel.replace(/_/g, " ") 
                            : `${percentage.toFixed(0)}%`}
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
        <div className="pt-8 border-t text-center">
          <div className="inline-block bg-primary/5 px-12 py-8 rounded-2xl">
            <p className="text-5xl font-bold text-primary mb-2">
              {overallPercentage.toFixed(1)}%
            </p>
            <p className="text-2xl font-semibold">
              {overallGrade}
              {overallCompetency && (
                <span className="ml-4 text-lg font-normal text-muted-foreground">
                  • {overallCompetency.replace(/_/g, " ")}
                </span>
              )}
            </p>
          </div>

          {remarks && (
            <div className="mt-10 p-6 bg-muted/50 rounded-xl border">
              <p className="text-sm font-medium text-muted-foreground mb-2">TEACHER’S REMARKS</p>
              <p className="italic text-lg leading-relaxed">{remarks}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-8 border-t">
          Generated on {new Date().toLocaleDateString("en-GB")} • 
          {generatedBy && ` by ${generatedBy}`}
        </div>
      </CardContent>
    </Card>
  );
}