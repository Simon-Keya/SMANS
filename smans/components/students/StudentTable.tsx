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
import Link from "next/link";
import { useState } from "react";

export interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  class: string;           // class name
  email?: string | null;
  phone?: string | null;
  parentName?: string | null;
  parentPhone?: string | null;
}

interface Props {
  students: Student[];
  onDelete: (id: string) => Promise<void>;
}

export default function StudentTable({ students, onDelete }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.message || "Failed to delete student");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-md border border-neutral/30">
      <Table>
        <TableHeader>
          <TableRow className="bg-base-200">
            <TableHead>Adm No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-base-content/60">
                No students found
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id} className="hover:bg-base-200/50">
                <TableCell className="font-medium">{student.admissionNumber}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.class}</TableCell>
                <TableCell>{student.email ?? "—"}</TableCell>
                <TableCell>
                  {student.parentName ? (
                    <div>
                      <div>{student.parentName}</div>
                      {student.parentPhone && (
                        <div className="text-xs text-base-content/60">{student.parentPhone}</div>
                      )}
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/students/${student.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-error hover:text-error hover:bg-error/10"
                        disabled={deletingId === student.id}
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
                          This will permanently delete <strong>{student.name}</strong> 
                          (Adm: {student.admissionNumber}). 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(student.id)}
                          className="bg-error hover:bg-error/90 text-white"
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