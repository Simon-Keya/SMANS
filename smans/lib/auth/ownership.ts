/**
 * Canonical ownership / IDOR checks.
 * All resource access for non-admins should go through these helpers.
 */
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/permissions";

export type AuthUser = {
  id: string;
  role: Role;
  isActive?: boolean;
};

async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");
  if (user.isActive === false) throw new Error("Account deactivated");
  return {
    id: user.id,
    role: user.role as Role,
    isActive: user.isActive,
  };
}

/** Admin bypass */
function isAdmin(role: Role) {
  return role === "ADMIN";
}

/**
 * Can the current user access this student record?
 * - ADMIN: yes
 * - TEACHER: student in a class they teach
 * - PARENT: linked via parentId
 * - STUDENT: own student profile
 * - ACCOUNTANT: read-only allowed at caller discretion (fees)
 */
export async function assertCanAccessStudent(
  studentId: string,
  opts: { write?: boolean } = {}
): Promise<AuthUser> {
  const user = await requireUser();
  if (isAdmin(user.role)) return user;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      userId: true,
      parentId: true,
      classId: true,
      class: { select: { teacherId: true } },
    },
  });
  if (!student) throw new Error("Student not found");

  if (user.role === "STUDENT") {
    if (student.userId !== user.id) throw new Error("Forbidden");
    if (opts.write) throw new Error("Forbidden");
    return user;
  }

  if (user.role === "PARENT") {
    const parent = await prisma.parent.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!parent || student.parentId !== parent.id) {
      throw new Error("Forbidden");
    }
    if (opts.write) throw new Error("Forbidden");
    return user;
  }

  if (user.role === "TEACHER") {
    if (student.class?.teacherId !== user.id) {
      // Also allow if teacher assigned via other class teaching of same student? primary class teacher for now
      throw new Error("Forbidden");
    }
    return user;
  }

  if (user.role === "ACCOUNTANT") {
    if (opts.write) throw new Error("Forbidden");
    return user;
  }

  throw new Error("Forbidden");
}

export async function assertCanAccessClass(
  classId: string,
  opts: { write?: boolean } = {}
): Promise<AuthUser> {
  const user = await requireUser();
  if (isAdmin(user.role)) return user;

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { id: true, teacherId: true },
  });
  if (!cls) throw new Error("Class not found");

  if (user.role === "TEACHER") {
    if (cls.teacherId !== user.id) throw new Error("Forbidden");
    return user;
  }

  if (user.role === "STUDENT" || user.role === "PARENT") {
    if (opts.write) throw new Error("Forbidden");
    // verify membership
    if (user.role === "STUDENT") {
      const st = await prisma.student.findFirst({
        where: { userId: user.id, classId },
      });
      if (!st) throw new Error("Forbidden");
    } else {
      const parent = await prisma.parent.findFirst({
        where: { userId: user.id },
        include: { students: { where: { classId }, select: { id: true } } },
      });
      if (!parent?.students.length) throw new Error("Forbidden");
    }
    return user;
  }

  throw new Error("Forbidden");
}

export async function assertCanAccessInvoice(
  invoiceId: string,
  opts: { write?: boolean } = {}
): Promise<AuthUser> {
  const user = await requireUser();
  if (isAdmin(user.role)) return user;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      id: true,
      studentId: true,
      student: { select: { parentId: true, userId: true } },
    },
  });
  if (!invoice) throw new Error("Invoice not found");

  if (user.role === "ACCOUNTANT") return user;

  if (user.role === "PARENT") {
    const parent = await prisma.parent.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!parent || invoice.student.parentId !== parent.id) {
      throw new Error("Forbidden");
    }
    if (opts.write) throw new Error("Forbidden");
    return user;
  }

  if (user.role === "STUDENT") {
    if (invoice.student.userId !== user.id) throw new Error("Forbidden");
    if (opts.write) throw new Error("Forbidden");
    return user;
  }

  throw new Error("Forbidden");
}

export async function assertCanAccessNotification(
  notificationId: string
): Promise<AuthUser> {
  const user = await requireUser();
  if (isAdmin(user.role)) return user;

  const n = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true },
  });
  if (!n) throw new Error("Notification not found");
  if (n.userId !== user.id) throw new Error("Forbidden");
  return user;
}

/** List student IDs visible to the current user */
export async function listAccessibleStudentIds(): Promise<string[]> {
  const user = await requireUser();
  if (isAdmin(user.role) || user.role === "ACCOUNTANT") {
    const all = await prisma.student.findMany({ select: { id: true } });
    return all.map((s) => s.id);
  }
  if (user.role === "TEACHER") {
    const classes = await prisma.class.findMany({
      where: { teacherId: user.id },
      select: { students: { select: { id: true } } },
    });
    return classes.flatMap((c) => c.students.map((s) => s.id));
  }
  if (user.role === "PARENT") {
    const parent = await prisma.parent.findFirst({
      where: { userId: user.id },
      select: { students: { select: { id: true } } },
    });
    return parent?.students.map((s) => s.id) ?? [];
  }
  if (user.role === "STUDENT") {
    const st = await prisma.student.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    return st ? [st.id] : [];
  }
  return [];
}
