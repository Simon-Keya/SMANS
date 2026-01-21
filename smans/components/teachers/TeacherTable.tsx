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
} from "@/components/ui/alert-dialog"; // ← Fixed: alert-dialog (not dialogue)
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

interface Teacher {
  id: string;
  name: string;
  email: string;
  role?: string;           // ← Optional as per your query
  createdAt: Date;
}

interface TeacherTableProps {
  teachers: Teacher[];
  onDelete?: (id: string) => Promise<void>;
}

export default function TeacherTable({ teachers, onDelete }: TeacherTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!onDelete) return;

    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      console.error("Delete failed:", err);
      // Optional: show toast error
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
              <TableRow key={teacher.id}>
                <TableCell className="font-medium">{teacher.name}</TableCell>
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
                  {/* View Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    aria-label="View teacher details"
                  >
                    <Link href={`/dashboard/teachers/${teacher.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>

                  {/* Edit Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    aria-label="Edit teacher"
                  >
                    <Link href={`/dashboard/teachers/${teacher.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>

                  {/* Delete Button (with confirmation) */}
                  {onDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingId === teacher.id}
                          aria-label="Delete teacher"
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
                            This will permanently delete <strong>{teacher.name}</strong>.
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