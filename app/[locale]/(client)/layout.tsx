import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value;

    if (!token) redirect("/login");

    return (
        <div>
            <nav>Menu Admin</nav>
            <main>{children}</main>
        </div>
    );
}
