"use client"

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PlanningPage() {
    const router = useRouter();

    useEffect(() => {
        // Rediriger vers l'onglet par défaut "auto"
        router.push('/planning/auto?type=planning');
    }, [router]);

    return null;
}
