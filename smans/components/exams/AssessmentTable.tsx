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

interface Assessment {
  id: string;
  title: string;
  learningArea: { name: string };     // Changed from subject
  class: { name: string };
  date: Date;
  status: string;
  assessmentType?: string;            // CBC-specific: Formative, Summative, CBC Check
}

interface AssessmentTableProps {
  assessments: Assessment[];
  onDelete?: (id: string) => Promise<void>;
}

export default function AssessmentTable({ assessments, onDelete }: AssessmentTableProps) {
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
            <TableHead>Assessment Title</TableHead>
            <TableHead>Learning Area</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No assessments scheduled yet.
              </TableCell>
            </TableRow>
          ) : (
            assessments.map((assessment) => (
              <TableRow key={assessment.id}>
                <TableCell className="font-medium">{assessment.title}</TableCell>
                <TableCell>{assessment.learningArea?.name ?? "—"}</TableCell>
                <TableCell>{assessment.class?.name ?? "—"}</TableCell>
                <TableCell>{new Date(assessment.date).toLocaleDateString()}</TableCell>
                
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {assessment.assessmentType || "Summative"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      assessment.status === "upcoming" || assessment.status === "scheduled"
                        ? "default"
                        : assessment.status === "completed"
                        ? "secondary"
                        : "destructive"
                    }
                    className="capitalize"
                  >
                    {assessment.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" asChild aria-label="View assessment">
                    <Link href={`/dashboard/exams/${assessment.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button variant="ghost" size="icon" asChild aria-label="Edit assessment">
                    <Link href={`/dashboard/exams/${assessment.id}/edit`}>
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
                          disabled={deletingId === assessment.id}
                          aria-label="Delete assessment"
                        >
                          {deletingId === assessment.id ? (
                            <span className="loading loading-spinner loading-sm" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Assessment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete <strong>{assessment.title}</strong>.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(assessment.id)}
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