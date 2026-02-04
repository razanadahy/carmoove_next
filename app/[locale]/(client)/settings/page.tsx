"use client"

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Rediriger vers l'onglet par défaut "global"
        const basePath = pathname.split('/settings')[0];
        router.push(`${basePath}/settings/global`);
    }, [router, pathname]);

    return null;
}
