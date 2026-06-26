// app/api/fees/structure/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { requireRole, type AppRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createFeeItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
  frequency: z.enum(["ONCE", "MONTHLY", "TERM", "YEARLY"]),
  description: z.string().optional().nullable(),
});

// GET: List all fee items
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ Only ADMIN and ACCOUNTANT can view fee items
    await requireRole(["ADMIN", "ACCOUNTANT"] as AppRole[]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const frequency = searchParams.get("frequency");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "100");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (frequency) {
      where.frequency = frequency;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.feeItem.count({ where });

    // Get fee items with pagination
    const feeItems = await prisma.feeItem.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            invoices: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: feeItems,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/fees/structure error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fee items" },
      { status: 500 }
    );
  }
}

// POST: Create a new fee item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ Only ADMIN can create fee items
    await requireRole(["ADMIN"] as AppRole[]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const validated = createFeeItemSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: validated.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { name, amount, frequency, description } = validated.data;

    // Check if fee item with same name exists
    const existing = await prisma.feeItem.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A fee item with this name already exists" },
        { status: 409 }
      );
    }

    const feeItem = await prisma.feeItem.create({
      data: {
        name: name.trim(),
        amount,
        frequency,
        description: description || null,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Fee item created successfully",
        data: feeItem 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/fees/structure error:", error);
    return NextResponse.json(
      { error: "Failed to create fee item" },
      { status: 500 }
    );
  }
}

// PUT: Bulk update or replace fee items (optional - for batch operations)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ Only ADMIN can perform bulk updates
    await requireRole(["ADMIN"] as AppRole[]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { action, ids, data } = body;

    // Validate request
    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Required: action, ids (array)" },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case "delete":
        // Check if any fee items are linked to invoices
        const feeItemsWithInvoices = await prisma.feeItem.findMany({
          where: {
            id: { in: ids },
            invoices: {
              some: {},
            },
          },
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                invoices: true,
              },
            },
          },
        });

        if (feeItemsWithInvoices.length > 0) {
          return NextResponse.json(
            {
              error: "Cannot delete fee items that are linked to invoices",
              feeItems: feeItemsWithInvoices.map(item => ({
                id: item.id,
                name: item.name,
                invoiceCount: item._count.invoices,
              })),
            },
            { status: 400 }
          );
        }

        result = await prisma.feeItem.deleteMany({
          where: {
            id: { in: ids },
          },
        });
        return NextResponse.json({
          success: true,
          message: `Deleted ${result.count} fee items`,
          count: result.count,
        });

      case "update":
        if (!data || typeof data !== 'object') {
          return NextResponse.json(
            { error: "Data object required for update action" },
            { status: 400 }
          );
        }

        result = await prisma.feeItem.updateMany({
          where: {
            id: { in: ids },
          },
          data,
        });
        return NextResponse.json({
          success: true,
          message: `Updated ${result.count} fee items`,
          count: result.count,
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Allowed: delete, update` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("PUT /api/fees/structure error:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}