// app/actions/parents/updateParent.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const updateParentSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().nullable(),
  phone: z.string().min(9, "Phone number must be at least 9 characters"),
  occupation: z.string().optional().nullable(),
  relationship: z.string().optional().nullable(),
});

export async function updateParent(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized: Only admins can update parents");
    }

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const occupation = formData.get("occupation") as string;
    const relationship = formData.get("relationship") as string;

    // Validate
    const parsed = updateParentSchema.safeParse({
      id,
      name,
      email: email || null,
      phone,
      occupation: occupation || null,
      relationship: relationship || null,
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || "Validation failed");
    }

    const { name: validatedName, email: validatedEmail, phone: validatedPhone, occupation: validatedOccupation, relationship: validatedRelationship } = parsed.data;

    // Check if parent exists
    const existingParent = await prisma.parent.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingParent) {
      throw new Error("Parent not found");
    }

    // Check email conflict
    if (validatedEmail && validatedEmail !== existingParent.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedEmail },
      });
      const existingParentEmail = await prisma.parent.findFirst({
        where: {
          email: validatedEmail,
          id: { not: id },
        },
      });

      if (existingUser || existingParentEmail) {
        throw new Error("Email already in use");
      }
    }

    // Check phone conflict
    if (validatedPhone && validatedPhone !== existingParent.phone) {
      const existingPhone = await prisma.parent.findFirst({
        where: {
          phone: validatedPhone,
          id: { not: id },
        },
      });

      if (existingPhone) {
        throw new Error("Phone number already in use");
      }
    }

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      // Update User if exists
      if (existingParent.userId) {
        const userUpdateData: any = {};
        if (validatedEmail) userUpdateData.email = validatedEmail;
        if (validatedPhone) userUpdateData.phone = validatedPhone;
        if (validatedName) userUpdateData.name = validatedName;

        if (Object.keys(userUpdateData).length > 0) {
          await tx.user.update({
            where: { id: existingParent.userId },
            data: userUpdateData,
          });
        }
      }

      // Update Parent
      await tx.parent.update({
        where: { id },
        data: {
          name: validatedName,
          email: validatedEmail || null,
          phone: validatedPhone,
          occupation: validatedOccupation || null,
          relationship: validatedRelationship || null,
        },
      });
    });

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_PARENT",
          entity: "Parent",
          entityId: id,
          metadata: {
            updatedFields: ["name", "email", "phone", "occupation", "relationship"],
          },
        },
      });
    } catch (auditError) {
      console.error("Audit log error:", auditError);
    }

    revalidatePath(`/dashboard/parents/${id}`);
    revalidatePath("/dashboard/parents");

    // Redirect on success
    redirect(`/dashboard/parents/${id}`);
  } catch (error: any) {
    console.error("[UPDATE_PARENT]", error);
    // Throw the error to be caught by the error boundary
    throw new Error(error.message || "Failed to update parent");
  }
}