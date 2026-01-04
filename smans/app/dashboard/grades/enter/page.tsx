import GradeEntryClient from "./GradeEntryClient";

const subjects = ["Mathematics", "Science", "English", "History", "Geography"];

export default function EnterGradesPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Enter Grades</h1>

      <GradeEntryClient
        studentName="John Doe"
        subjects={subjects}
      />
    </div>
  );
}
