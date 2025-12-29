import TimetableForm from "@/components/timetable/TimetableForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function CreateTimetablePage() {
  const handleSubmit = async (data: any) => {
    "use server";
    // Save to DB
    console.log("Saved:", data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Timetable Period</CardTitle>
        </CardHeader>
        <CardContent>
          <TimetableForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}