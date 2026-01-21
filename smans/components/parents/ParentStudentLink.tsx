// components/parents/ParentStudentLink.tsx
"use client";

import { Button } from "@/components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Plus } from "lucide-react";
import { useState } from "react";

interface ParentStudentLinkProps {
  parentId: string;
}

export default function ParentStudentLink({ parentId }: ParentStudentLinkProps) {
  const [open, setOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");

  const handleLink = async () => {
    // TODO: Implement actual linking logic (API call)
    console.log("Linking parent", parentId, "to student email:", studentEmail);
    setOpen(false);
    setStudentEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Link Student
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Student to Parent</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="student-email">Student Email</Label>
            <Input
              id="student-email"
              placeholder="student@smans.ac.ke"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enter the student's email address to link them to this parent.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleLink} disabled={!studentEmail.trim()}>
              Link Student
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}