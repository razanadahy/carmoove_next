'use client'
import {useQuery} from "@apollo/client";
import {ME_QUERY} from "@/lib/graphql/queries";
import {useGetVehicles} from "@/lib/hooks";

export default function Notification() {
    const { loading: ld_user, error: er_user, data: data_user } = useQuery(ME_QUERY, {
        //fetchPolicy: "network-only"
    });
    const { vehicles, loading, error } = useGetVehicles(120000)
    return(
        <>
            huhuh...ato de nilamina eh
        </>
    )
}