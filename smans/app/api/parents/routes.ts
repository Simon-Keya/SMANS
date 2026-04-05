// app/api/parents/route.ts
import { authOptions } from "@/lib/auth/auth";
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
          select: { 
            id: true, 
            name: true, 
            admissionNumber: true   // ← Changed from rollNumber
          },
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
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = parsed.data;

    // Check email uniqueness
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      const existingParent = await prisma.parent.findFirst({ where: { email } });

      if (existingUser || existingParent) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    let userId: string | undefined;

    // Optional: Auto-create User account for parent (uncomment if you want this feature)
    /*
    if (email && password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "PARENT",
          isActive: true,
        },
      });
      userId = newUser.id;
    }
    */

    const parent = await prisma.parent.create({
      data: {
        name,
        email: email || null,
        phone,
        userId,
      },
      include: {
        students: { 
          select: { id: true, name: true, admissionNumber: true }   // ← Changed
        },
      },
    });

    return NextResponse.json({ success: true, data: parent }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_PARENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}