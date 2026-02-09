'use client'

import {IVehicle} from "@/lib/hooks/Interfaces";
import {App, Form, Select} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    deleteVehicleParking,
    getParkings,
    getVehicleParking, IRespVehicleParking,
    updateVehicleParking
} from "@/app/actions/parkingServices";
import {Loading} from "@/components/Common/Loading";
interface IPropsParkingSection {
    vehicle: IVehicle
}

const ParkingSection = (props: IPropsParkingSection) => {
    const {notification} = App.useApp()
    const [form] = Form.useForm()
    const queryClient = useQueryClient()

    const qVehicleParking = useQuery({
        queryKey: ['vehicleParking', props.vehicle.id],
        queryFn: () => getVehicleParking({
            id: props.vehicle.id
        }),
    })

    const qParkings = useQuery({
        queryKey: ['parkings'],
        queryFn: () => getParkings(),
    })

    const mUpdateVehicleParking = useMutation({
        mutationFn: updateVehicleParking,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['vehicleParking', props.vehicle.id],
            })
            notification['success']({
                message: 'Mise à jour du stationnement du véhicule avec succès'
            })
        },
        onError: () => {
            notification['error']({
                message: 'Echec lors de la mise à jour du stationnement du véhicule, veuillez réessayer.'
            });
        }
    })

    const mDeleteVehicleParking = useMutation({
        mutationFn: deleteVehicleParking,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['vehicleParking', props.vehicle.id],
            })
            notification['success']({
                message: 'Mise à jour du stationnement du véhicule avec succès'
            })
        },
        onError: () => {
            notification['error']({
                message: 'Echec lors de la mise à jour du stationnement du véhicule, veuillez réessayer.'
            });
        }
    })

    if (qVehicleParking.isLoading || qParkings.isLoading) return <Loading msg="Chargement de parking" />



    const vehicleParking: IRespVehicleParking = !!qVehicleParking.data?.id ? qVehicleParking.data : {
        address: '',
        address2: '',
        city: '',
        country: '',
        error: '',
        id: 'geoloc',
        name: '',
        zipcode: ''
    }

    const handleUpdateVParking = (parking: IRespVehicleParking) => {
        if (parking.id === 'geoloc') {
            handleClearVParking()
        } else if (!!parking.id) {
            mUpdateVehicleParking.mutate({
                vehicleId: props.vehicle.id,
                parkingId: parking.id
            })
        }
    }

    const handleClearVParking = () => {
        mDeleteVehicleParking.mutate({
            vehicleId: props.vehicle.id
        })
    }

    return (
        <Form
            className="form-parking-specs"
            layout="vertical"
            form={form}
            onFinish={handleUpdateVParking}
            initialValues={vehicleParking}
        >
            {/* <Form.Item
        label="Stationnement géolocalisé"
        hasFeedback
      >
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
        <span className="label-switch-form">Je souhaite utiliser la géolocalisation comme lieu de stationnement.</span>
      </Form.Item> */}
            <Form.Item
                name="id"
                label="Stationnement"
                hasFeedback
                required
            >
                <Select
                    showSearch
                    allowClear
                    placeholder="Choisir un stationnement"
                    optionFilterProp="label"
                    onClear={() => handleClearVParking()}
                    options={
                        [{ value: 'geoloc', label: 'Géolocalisation' }, ...(qParkings.data?.parkings ?? []).map(p => ({ value: p.id, label: p.name }))]
                    }
                    onSelect={() => form.submit()}
                />
            </Form.Item>
        </Form>
    )
}

export default ParkingSection