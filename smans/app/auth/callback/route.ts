// Usually not needed if using the standard [...nextauth] route
// But if you want a custom callback page, you can handle it here


export { GET, POST } from "next-auth/middleware"; // Or use default handler

// If you need custom logic:
// export async function GET(request: Request) {
//   // Custom callback handling if needed
//   return NextResponse.redirect(new URL("/dashboard", request.url));
// }