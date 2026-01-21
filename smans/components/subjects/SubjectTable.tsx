// components/subjects/SubjectTable.tsx
"use client";

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

interface Subject {
  id: string;
  name: string;
  code: string;
  teacherName?: string | null;
  classCount?: number;
  createdAt: Date;
}

interface SubjectTableProps {
  subjects: Subject[];
  onDelete?: (id: string) => Promise<void>;
}

export default function SubjectTable({ subjects, onDelete }: SubjectTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Classes</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No subjects found.
              </TableCell>
            </TableRow>
          ) : (
            subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{subject.code}</Badge>
                </TableCell>
                <TableCell>{subject.teacherName ?? "—"}</TableCell>
                <TableCell>{subject.classCount ?? 0}</TableCell>
                <TableCell>
                  {new Date(subject.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" asChild aria-label="View">
                    <Link href={`/dashboard/subjects/${subject.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button variant="ghost" size="icon" asChild aria-label="Edit">
                    <Link href={`/dashboard/subjects/${subject.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>

                  {onDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingId === subject.id}
                          aria-label="Delete subject"
                        >
                          {deletingId === subject.id ? (
                            <span className="loading loading-spinner loading-sm" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete <strong>{subject.name}</strong> ({subject.code}).
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(subject.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}