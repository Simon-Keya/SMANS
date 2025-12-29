import GradeTable from "@/components/grades/GradeTable";
import ReportCard from "@/components/grades/ReportCard";

export default function StudentGradesPage() {
  const grades = [
    { subject: "Math", marks: 95, maxMarks: 100 },
    { subject: "Science", marks: 88, maxMarks: 100 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Student Grades</h1>
      <GradeTable grades={grades} />
      <ReportCard
        studentName="John Doe"
        className="10"
        examName="Mid Term"
        grades={grades.map(g => ({ ...g, grade: "A" }))}
        overallPercentage={91.5}
        overallGrade="A"
      />
    </div>
  );
}