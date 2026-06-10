import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function GradesReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Get average marks per subject
  const averageBySubject = await prisma.grade.groupBy({
    by: ["subjectId"],
    _avg: { marks: true },
    _count: { marks: true },
  });

  // Get average marks per exam
  const averageByExam = await prisma.grade.groupBy({
    by: ["examId"],
    _avg: { marks: true },
    _count: { marks: true },
  });

  // Get overall statistics
  const overallStats = await prisma.grade.aggregate({
    _avg: { marks: true, maxMarks: true },
    _sum: { marks: true, maxMarks: true },
    _count: { marks: true },
    _min: { marks: true },
    _max: { marks: true },
  });

  // Get subject details
  const subjects = await prisma.subject.findMany({
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  // Get exam details
  const exams = await prisma.exam.findMany({
    select: {
      id: true,
      name: true,
      term: true,
    },
  });

  // Calculate average percentage
  const averagePercentage = overallStats._avg.marks && overallStats._avg.maxMarks
    ? (overallStats._avg.marks / overallStats._avg.maxMarks) * 100
    : 0;

  // Map subject averages
  const subjectAverages = averageBySubject.map(item => {
    const subject = subjects.find(s => s.id === item.subjectId);
    const averagePercentage = item._avg.marks && item._avg.marks !== null
      ? (item._avg.marks / 100) * 100 // Assuming max marks is 100, adjust as needed
      : 0;
    
    return {
      subjectName: subject?.name || "Unknown",
      subjectCode: subject?.code,
      averageMarks: item._avg.marks?.toFixed(2) || "0",
      studentCount: item._count.marks,
      averagePercentage: averagePercentage.toFixed(1),
    };
  });

  // Get grade distribution
  const gradeDistribution = await prisma.grade.groupBy({
    by: ["marks"],
    _count: { marks: true },
  });

  // Define grade bands
  const bands = {
    "Excellent (80-100)": { min: 80, max: 100, count: 0 },
    "Good (65-79)": { min: 65, max: 79, count: 0 },
    "Satisfactory (50-64)": { min: 50, max: 64, count: 0 },
    "Below Average (35-49)": { min: 35, max: 49, count: 0 },
    "Poor (0-34)": { min: 0, max: 34, count: 0 },
  };

  gradeDistribution.forEach(item => {
    const marks = item.marks;
    for (const [band, range] of Object.entries(bands)) {
      if (marks >= range.min && marks <= range.max) {
        bands[band as keyof typeof bands].count += item._count.marks;
      }
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Grades & Performance Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">
              {overallStats._avg.marks?.toFixed(1) || "0"}%
            </p>
            <p className="text-sm text-base-content/60 mt-2">
              Out of {overallStats._avg.maxMarks?.toFixed(0) || "100"} marks
            </p>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Total Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">
              {overallStats._count.marks || 0}
            </p>
            <p className="text-sm text-base-content/60 mt-2">
              Records entered
            </p>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Highest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-success">
              {overallStats._max.marks || 0}%
            </p>
            <p className="text-sm text-base-content/60 mt-2">
              Best performance
            </p>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Lowest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-error">
              {overallStats._min.marks || 0}%
            </p>
            <p className="text-sm text-base-content/60 mt-2">
              Needs improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card className="bg-base-100 shadow-lg border border-base-200">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(bands).map(([band, data]) => (
              <div key={band}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{band}</span>
                  <span>{data.count} students</span>
                </div>
                <div className="h-2 bg-base-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(data.count / overallStats._count.marks) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject Performance */}
      <Card className="bg-base-100 shadow-lg border border-base-200">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Subject Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectAverages.map((subject) => (
              <div key={subject.subjectCode}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{subject.subjectName}</span>
                  <span>{subject.averagePercentage}% ({subject.averageMarks} marks)</span>
                </div>
                <div className="h-2 bg-base-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-success rounded-full transition-all duration-500"
                    style={{ width: `${subject.averagePercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exam Performance */}
      <Card className="bg-base-100 shadow-lg border border-base-200">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Exam Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Exam</th>
                  <th className="text-left p-2">Term</th>
                  <th className="text-right p-2">Average Marks</th>
                  <th className="text-right p-2">Students</th>
                </tr>
              </thead>
              <tbody>
                {averageByExam.map((item) => {
                  const exam = exams.find(e => e.id === item.examId);
                  return (
                    <tr key={item.examId} className="border-b">
                      <td className="p-2">{exam?.name || "Unknown"}</td>
                      <td className="p-2">{exam?.term || "—"}</td>
                      <td className="p-2 text-right">{item._avg.marks?.toFixed(1) || "0"}</td>
                      <td className="p-2 text-right">{item._count.marks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}