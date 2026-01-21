// components/classes/ClassTable.tsx
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

interface Class {
  id: string;
  name: string;
  level: string;
  teacher?: { name: string } | null;
  studentCount: number;
}

interface ClassTableProps {
  classes: Class[];
  onDelete?: (id: string) => Promise<void>;
}

export default function ClassTable({ classes, onDelete }: ClassTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class Name</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Class Teacher</TableHead>
            <TableHead>Students</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No classes found.
              </TableCell>
            </TableRow>
          ) : (
            classes.map((cls) => (
              <TableRow key={cls.id}>
                <TableCell className="font-medium">{cls.name}</TableCell>
                <TableCell>{cls.level}</TableCell>
                <TableCell>{cls.teacher?.name ?? "Not assigned"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{cls.studentCount}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" asChild aria-label="View class">
                    <Link href={`/dashboard/classes/${cls.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button variant="ghost" size="icon" asChild aria-label="Edit class">
                    <Link href={`/dashboard/classes/${cls.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>

                  {onDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          disabled={deletingId === cls.id}
                          aria-label="Delete class"
                        >
                          {deletingId === cls.id ? (
                            <span className="loading loading-spinner loading-sm" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Class?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete <strong>{cls.name}</strong>.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(cls.id)}
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