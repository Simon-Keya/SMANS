// app/api/parents/route.ts
import { authOptions } from "@/lib/auth/auth"; // FIXED: correct path
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createParentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email").trim().toLowerCase().optional(),
  phone: z.string().min(9, "Phone number is required").trim(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parents = await prisma.parent.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        students: {
          select: { id: true, name: true, rollNumber: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: parents });
  } catch (error) {
    console.error("[GET_PARENTS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createParentSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = parsed.data;

    // Check if email already exists (in User or Parent)
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      const existingParent = await prisma.parent.findFirst({ where: { email } }); // FIXED: findFirst
      if (existingUser || existingParent) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    let userId: string | undefined;

    // Optional: auto-create User account for parent (uncomment if needed)
    /*
    if (email && password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: "PARENT",
        },
      });
      userId = newUser.id;
    }
    */

    const parent = await prisma.parent.create({
      data: {
        name,
        email,
        phone,
        userId,
      },
      include: {
        students: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, data: parent }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_PARENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}