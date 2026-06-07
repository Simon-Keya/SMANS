// app/test-db/page.tsx
import { prisma } from "@/lib/prisma";

export default async function TestDbPage() {
  try {
    // Test connection and count users
    const userCount = await prisma.user.count();
    const allUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      take: 5,
    });

    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
        
        <div className="bg-green-100 border border-green-500 text-green-700 p-4 rounded-lg mb-6">
          ✅ Database is connected successfully!
        </div>

        <p><strong>Total Users in Database:</strong> {userCount}</p>

        <h2 className="text-xl mt-8 mb-4">Recent Users:</h2>
        <pre className="bg-gray-900 text-white p-4 rounded overflow-auto">
          {JSON.stringify(allUsers, null, 2)}
        </pre>
      </div>
    );
  } catch (error: any) {
    console.error("Database Error:", error);
    
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold text-red-600">Database Connection Failed</h1>
        <div className="bg-red-100 border border-red-500 text-red-700 p-6 rounded-lg mt-4">
          <p><strong>Error:</strong> {error.message}</p>
          <p className="mt-2">Check your database URL and Prisma configuration.</p>
        </div>
      </div>
    );
  }
}