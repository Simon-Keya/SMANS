import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="auth-container text-center">
      <h1>403 - Unauthorized</h1>
      <p>You do not have permission to access this page.</p>

      <Link href="/dashboard">
        <button>Go Back to Dashboard</button>
      </Link>
    </div>
  );
}