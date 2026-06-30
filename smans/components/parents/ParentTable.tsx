// components/parents/ParentTable.tsx
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

interface Parent {
  id: string;
  name: string | null;
  email: string;
  phone?: string | null;
  childrenCount?: number;
  createdAt: Date;
}

interface ParentTableProps {
  parents: Parent[];
  onDelete?: (id: string) => Promise<void>;
  deletingId?: string | null;
}

export default function ParentTable({ 
  parents, 
  onDelete,
  deletingId: externalDeletingId 
}: ParentTableProps) {
  const [internalDeletingId, setInternalDeletingId] = useState<string | null>(null);
  
  // Use external deletingId if provided, otherwise use internal state
  const deletingId = externalDeletingId !== undefined ? externalDeletingId : internalDeletingId;

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    setInternalDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      console.error("Delete parent failed:", err);
    } finally {
      setInternalDeletingId(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Children</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No parents found.
              </TableCell>
            </TableRow>
          ) : (
            parents.map((parent) => (
              <TableRow key={parent.id}>
                <TableCell className="font-medium">
                  {parent.name ?? "Unnamed Parent"}
                </TableCell>
                <TableCell>{parent.email || "No email"}</TableCell>
                <TableCell>{parent.phone ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {parent.childrenCount ?? 0} children
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(parent.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" asChild aria-label="View parent">
                    <Link href={`/dashboard/parents/${parent.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button variant="ghost" size="icon" asChild aria-label="Edit parent">
                    <Link href={`/dashboard/parents/${parent.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>

                  {/* ✅ Delete Button with Confirmation Dialog */}
                  {onDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingId === parent.id}
                          aria-label="Delete parent"
                        >
                          {deletingId === parent.id ? (
                            <span className="loading loading-spinner loading-sm" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Parent?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete <strong>{parent.name ?? "this parent"}</strong>.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(parent.id)}
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