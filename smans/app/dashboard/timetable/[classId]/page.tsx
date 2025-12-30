import TimetableGrid from "@/components/timetable/TimetableGrid";

// Define the type based on your TimetableGrid props
interface TimetablePeriod {
  id: string;
  class: string;
  day: string;
  time: string;
  subject: string;
  teacher?: string;
  room?: string;
}

export default function ClassTimetablePage({ params }: { params: { classId: string } }) {
  // Explicitly type the array — replace with real data later
  const periods: TimetablePeriod[] = [
    // Example mock data
    {
      id: "1",
      class: params.classId,
      day: "Monday",
      time: "8:00-9:00",
      subject: "Mathematics",
      teacher: "Mr. Kamau",
      room: "Room 101",
    },
    {
      id: "2",
      class: params.classId,
      day: "Monday",
      time: "9:00-10:00",
      subject: "English",
      teacher: "Ms. Wanjiku",
      room: "Room 102",
    },
    // Add more periods as needed
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Class {params.classId} Timetable</h1>
      <TimetableGrid periods={periods} />
    </div>
  );
}