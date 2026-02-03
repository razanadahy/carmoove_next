import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {Providers} from "@/app/providers";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value;

    if (!token) redirect("/login");

    return (
        <Providers>{children}</Providers>
    );
}
