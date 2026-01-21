// components/parents/ParentCard.tsx
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Edit, Eye, Trash2 } from "lucide-react";
import Link from "next/link";

interface Parent {
  id: string;
  name: string | null;
  email: string;
  childrenCount?: number;
}

interface ParentCardProps {
  parent: Parent;
  onDelete?: (id: string) => void;
}

export default function ParentCard({ parent, onDelete }: ParentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow bg-base-100 border-base-200">
      <CardHeader>
        <CardTitle className="text-lg text-primary">
          {parent.name ?? "Unnamed Parent"}
        </CardTitle>
        <Badge variant="outline" className="mt-1">
          {parent.childrenCount ?? 0} children
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1 text-sm">
          <p><strong>Email:</strong> {parent.email}</p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/parents/${parent.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/parents/${parent.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>

          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(parent.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}