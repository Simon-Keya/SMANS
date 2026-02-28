// components/AssignmentCard.tsx
import { Assignment } from "@/hooks/useAssignments";

interface Props {
  assignment: Assignment;
}

export default function AssignmentCard({ assignment }: Props) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        {assignment.title}
      </h3>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        {assignment.description || "No description"}
      </p>
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Subject: {assignment.subject.name} ({assignment.subject.code})</p>
        <p>Class: {assignment.class.name}</p>
        <p>Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
        {assignment.createdByUser && (
          <p>Created by: {assignment.createdByUser.name}</p>
        )}
      </div>
    </div>
  );
}