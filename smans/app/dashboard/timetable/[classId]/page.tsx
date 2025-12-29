import TimetableGrid from "@/components/timetable/TimetableGrid";

export default function ClassTimetablePage() {
  const periods = []; // Fetch by classId

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Class 10 Timetable</h1>
      <TimetableGrid periods={periods} />
    </div>
  );
}