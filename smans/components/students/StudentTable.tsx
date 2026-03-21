"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { useState } from "react"; // ← FIXED: import useState

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  email?: string | null;
  phone?: string | null;
  parentPhone?: string | null;
}

interface Props {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function StudentTable({ students, onEdit, onDelete }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      console.error("Delete failed:", err);
      // Optional: show toast error here
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-md border">
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
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No students found
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.rollNumber}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.class}</TableCell>
                <TableCell>{student.email ?? "-"}</TableCell>
                <TableCell>{student.parentPhone ?? "-"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(student)}
                    aria-label="Edit student"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={deletingId === student.id}
                        aria-label="Delete student"
                      >
                        {deletingId === student.id ? (
                          <span className="loading loading-spinner loading-sm" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Student?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete <strong>{student.name}</strong> (Roll: {student.rollNumber}).
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(student.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}