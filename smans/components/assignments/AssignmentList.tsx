// components/AssignmentList.tsx
import { useAssignments } from "@/hooks/useAssignments";
import AssignmentCard from "./AssignmentCard";

interface Props {
  classId?: string;
  studentId?: string;
}

export default function AssignmentList({ classId, studentId }: Props) {
  const { assignments, isLoading, error } = useAssignments({ classId, studentId });

  if (isLoading) return <p>Loading assignments...</p>;
  if (error) return <p>Error loading assignments: {error.message}</p>;

  if (assignments.length === 0) {
    return <p className="text-gray-500">No assignments found</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assignments.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </div>
  );
}