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
} from "@/components/ui/alert-dialogue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Edit, Eye, Trash2 } from "lucide-react";
import Link from "next/link";

interface Parent {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  childrenCount?: number;
}

interface ParentTableProps {
  parents: Parent[];
  onDelete?: (id: string) => Promise<void>;
}

export default function ParentTable({ parents, onDelete }: ParentTableProps) {
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
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Children</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No parents found.
              </TableCell>
            </TableRow>
          ) : (
            parents.map((parent) => (
              <TableRow key={parent.id}>
                <TableCell className="font-medium">
                  {parent.name ?? "Unnamed Parent"}
                </TableCell>
                <TableCell>{parent.email}</TableCell>
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

                  {onDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
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