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

    if (!exam) throw new Error(`Exam with ID ${examId} not found`);

    // Fetch all grades for this exam
    const grades = await prisma.grade.findMany({
      where: { examId },
      include: {
        student: {
          select: {
            name: true,
            email: true,
            parent: { select: { email: true } },
          },
        },
        subject: { select: { name: true } },
      },
    });

    if (grades.length === 0) {
      logger.info(`No grades found for exam ${examId} – nothing to publish`);
      return { success: true, message: "No grades to publish" };
    }

    // Mark exam as published
    await prisma.exam.update({
      where: { id: examId },
      data: { published: true },
    });

    logger.info(`Exam ${exam.name} marked as published`);

    // Send confirmation to teacher
    await EmailService.send(
      teacherEmail,
      `Grades Published - ${exam.name}`,
      `
        <h2>Grades Published Successfully</h2>
        <p>Dear ${teacherName},</p>
        <p>You have published grades for <strong>${exam.name}</strong> (${exam.class.name}).</p>
        <p>Total students graded: ${grades.length}</p>
        <p>Students and parents have been notified.</p>
        <p>View details in your dashboard.</p>
        <p>SMANS System</p>
      `
    );

    // Notify students and parents (loop – in production batch this)
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
        <p>Best regards,<br/>SMANS Team</p>
      `;

      if (studentEmail) {
        await EmailService.send(studentEmail, `Grades Published - ${exam.name}`, html);
      }

      if (parentEmail) {
        await EmailService.send(parentEmail, `Child's Grades Published - ${exam.name}`, html);
      }
    }

    logger.info(`Grades published and notifications sent for exam ${examId}`, {
      studentCount: grades.length,
    });

    return { success: true };
  } catch (error) {
    logger.error("Grade publish job failed", {
      error: error instanceof Error ? error.message : String(error),
      examId,
      classId,
    });

    throw error; // Let BullMQ retry if configured
  }
}