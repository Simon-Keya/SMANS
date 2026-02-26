// jobs/gradePublish.job.ts
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { EmailService } from "@/lib/services/email.service";

interface GradePublishJobData {
  examId: string;
  classId: string;
  teacherEmail: string;
  teacherName: string;
}

/**
 * Job: Publish grades for an exam and notify students/parents
 */
export async function gradePublishJob(data: GradePublishJobData) {
  const { examId, classId, teacherEmail, teacherName } = data;

  try {
    // Fetch exam
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { class: true },
    });

    if (!exam) throw new Error("Exam not found");

    // Fetch all grades for this exam
    const grades = await prisma.grade.findMany({
      where: { examId },
      include: {
        student: { select: { name: true, email: true, parent: { select: { email: true } } } },
        subject: { select: { name: true } },
      },
    });

    if (grades.length === 0) {
      logger.info(`No grades to publish for exam ${examId}`);
      return { success: true, message: "No grades found" };
    }

    // Update exam status to published (add status field if needed)
    await prisma.exam.update({
      where: { id: examId },
      data: { published: true }, // assume you have a published boolean field
    });

    // Send email to teacher (confirmation)
    await EmailService.send(
      teacherEmail,
      `Grades Published - ${exam.name}`,
      `
        <h2>Grades Published</h2>
        <p>Dear ${teacherName},</p>
        <p>You have successfully published grades for <strong>${exam.name}</strong> (${exam.class.name}).</p>
        <p>Total students graded: ${grades.length}</p>
        <p>Students and parents have been notified.</p>
        <p>SMANS System</p>
      `
    );

    // Notify students & parents (in real app, batch this)
    for (const grade of grades) {
      const studentEmail = grade.student.email;
      const parentEmail = grade.student.parent?.email;

      const html = `
        <h2>Grades Published - ${exam.name}</h2>
        <p>Dear ${grade.student.name},</p>
        <p>Your grade for <strong>${grade.subject.name}</strong> has been published:</p>
        <p><strong>Marks:</strong> ${grade.marks} / ${grade.maxMarks}</p>
        <p>View full results in your dashboard.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/student/results" style="display:inline-block; background:#10b981; color:white; padding:12px 24px; text-decoration:none; border-radius:6px;">
          View Results
        </a>
      `;

      if (studentEmail) {
        await EmailService.send(studentEmail, `Grades Published - ${exam.name}`, html);
      }

      if (parentEmail) {
        await EmailService.send(parentEmail, `Child's Grades Published - ${exam.name}`, html);
      }
    }

    logger.info(`Grades published and notifications sent for exam ${examId}`);

    return { success: true };
  } catch (error) {
    logger.error("Grade publish job failed", { error, examId });
    throw error;
  }
}