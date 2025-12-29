import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

interface AttendanceRecord {
  date: string;
  status: "present" | "absent" | "late";
}

interface AttendanceTableProps {
  records: AttendanceRecord[];
}

export default function AttendanceTable({ records }: AttendanceTableProps) {
  const getStatusBadge = (status: string) => {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.length === 0 ? (
          <TableRow>
            <TableCell colSpan={2} className="text-center">
              No attendance records
            </TableCell>
          </TableRow>
        ) : (
          records.map((record, i) => (
            <TableRow key={i}>
              <TableCell>{record.date}</TableCell>
              <TableCell className="text-right">{getStatusBadge(record.status)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}