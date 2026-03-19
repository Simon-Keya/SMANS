// components/attendance/AttendanceTable.tsx
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

interface AttendanceRecord {
  date: string;
  studentName?: string;
  status: "present" | "absent" | "late";
}

interface AttendanceTableProps {
  records: AttendanceRecord[];
}

export default function AttendanceTable({ records }: AttendanceTableProps) {
  const getStatusBadge = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "present":
        return <Badge variant="default">Present</Badge>;
      case "absent":
        return <Badge variant="destructive">Absent</Badge>;
      case "late":
        return <Badge variant="secondary">Late</Badge>;
      default:
        return <Badge variant="outline">N/A</Badge>;
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-base-200/80 hover:bg-base-200">
            <TableHead>Date</TableHead>
            <TableHead>Student</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-12 text-base-content/60">
                No attendance records found
              </TableCell>
            </TableRow>
          ) : (
            records.map((record, index) => (
              <TableRow
                key={`${record.date}-${index}`}
                className="hover:bg-base-300/50 transition-colors"
              >
                <TableCell className="font-medium">
                  {new Date(record.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{record.studentName || "—"}</TableCell>
                <TableCell className="text-right">
                  {getStatusBadge(record.status)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}