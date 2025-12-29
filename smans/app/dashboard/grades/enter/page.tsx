import GradeEntryForm from "@/components/grades/GradeEntryForm";

const subjects = ["Mathematics", "Science", "English", "History", "Geography"];

export default function EnterGradesPage() {
  const handleSubmit = (grades: any) => {
    console.log("Grades submitted:", grades);
    // Save via server action
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Enter Grades</h1>
      <GradeEntryForm studentName="John Doe" subjects={subjects} onSubmit={handleSubmit} />
    </div>
  );
}