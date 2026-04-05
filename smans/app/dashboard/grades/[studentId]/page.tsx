// app/dashboard/grades/page.tsx
import GradeTable from "@/components/grades/GradeTable";
import ReportCard from "@/components/reports/ReportCard";

export default function StudentGradesPage() {
  // Sample data - replace with real data from API/actions later
  const sampleGrades = [
    { 
      subject: "Mathematics", 
      marks: 92, 
      maxMarks: 100, 
      competencyLevel: "EXCEEDING_EXPECTATIONS" 
    },
    { 
      subject: "Science and Technology", 
      marks: 85, 
      maxMarks: 100, 
      competencyLevel: "MEETING_EXPECTATIONS" 
    },
    { 
      subject: "English", 
      marks: 78, 
      maxMarks: 100, 
      competencyLevel: "APPROACHING_EXPECTATIONS" 
    },
  ];

  const overallPercentage = 85.0;
  const overallGrade = "A-";
  const overallCompetency = "MEETING_EXPECTATIONS";

  return (
    <div className="space-y-10 p-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Student Grades & Reports</h1>
        <p className="text-muted-foreground mt-2">
          CBC Progress Reports and Assessment Records
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Recent Assessments</h2>
          <GradeTable grades={sampleGrades} />
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6">Sample Report Card</h2>
          <ReportCard
            studentName="John Doe"
            admissionNumber="SM/2026/045"           // ← Using admissionNumber
            className="Grade 4 Blue"
            term="TERM_1"
            year={2026}
            grades={sampleGrades}
            overallPercentage={overallPercentage}
            overallGrade={overallGrade}
            overallCompetency={overallCompetency}
            remarks="John continues to show excellent understanding of concepts. He is encouraged to participate more actively in group discussions."
            generatedBy="Ms. Jane Kamau"
          />
        </div>
      </div>
    </div>
  );
}