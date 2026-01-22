import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as z from "zod";

const createParentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email").trim().toLowerCase().optional(),
  phone: z.string().min(9, "Phone number is required").trim(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
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
          select: { name: true },
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createParentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = parsed.data;

    // Optional: check if email already exists in User model too
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    const parent = await prisma.parent.create({
      data: {
        name,
        email,
        phone,
        // If you want to auto-create a User account too, do it here
        // For now, just create Parent record
      },
    });

    return NextResponse.json({ success: true, data: parent }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_PARENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}