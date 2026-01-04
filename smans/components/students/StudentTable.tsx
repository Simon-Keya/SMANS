"use client";

import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Edit, Trash2 } from "lucide-react";

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  email?: string;
  parentPhone?: string;
}

interface Props {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

export default function StudentTable({ students, onEdit, onDelete }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Roll No</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Parent Phone</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {students.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              No students found
            </TableCell>
          </TableRow>
        ) : (
          students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.rollNumber}</TableCell>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.class}</TableCell>
              <TableCell>{student.email ?? "-"}</TableCell>
              <TableCell>{student.parentPhone ?? "-"}</TableCell>
              <TableCell className="text-right space-x-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(student)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(student.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
