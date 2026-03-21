import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Edit, Eye, Mail, Phone, Trash2 } from "lucide-react";
import Link from "next/link";

interface Parent {
  id: string;
  name: string | null;
  email: string;
  phone?: string | null;
  childrenCount?: number;
}

interface ParentCardProps {
  parent: Parent;
  onDelete?: (id: string) => Promise<void>;
}

export default function ParentCard({ parent, onDelete }: ParentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow bg-base-100 border-base-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-primary">
            {parent.name ?? "Unnamed Parent"}
          </CardTitle>
          <Badge variant="outline" className="capitalize">
            {parent.childrenCount ?? 0} children
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{parent.email}</span>
          </div>

          {parent.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{parent.phone}</span>
            </div>
          )}
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
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(parent.id)}
              aria-label="Delete parent"
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