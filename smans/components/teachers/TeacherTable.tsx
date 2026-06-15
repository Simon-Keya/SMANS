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
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Edit, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deleteTeacher } from "@/app/actions/teachers/deleteTeacher";   // ← Import this

interface Teacher {
  id: string;
  name: string | null;
  email: string;
  role?: string;
  createdAt: Date;
}

interface TeacherTableProps {
  teachers: Teacher[];
}

export default function TeacherTable({ teachers }: TeacherTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTeacher(id);
      alert("Teacher deleted successfully");
      window.location.reload(); // Simple refresh (you can improve this later)
    } catch (err: any) {
      alert(err.message || "Failed to delete teacher");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {teachers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No teachers found.
              </TableCell>
            </TableRow>
          ) : (
            teachers.map((teacher) => (
              <TableRow key={teacher.id} className="hover:bg-base-200">
                <TableCell className="font-medium">{teacher.name || "Unnamed Teacher"}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {teacher.role ?? "Teacher"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(teacher.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/teachers/${teacher.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/teachers/${teacher.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={deletingId === teacher.id}
                      >
                        {deletingId === teacher.id ? (
                          <span className="loading loading-spinner loading-sm" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Teacher?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete <strong>{teacher.name || "this teacher"}</strong>.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(teacher.id)}
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