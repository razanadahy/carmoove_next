'use client';

import { create } from 'zustand';
import { IVehicle } from '@/lib/hooks/Interfaces';

interface MapStore {
    vehiclesSelected: IVehicle[];
    setVehiclesSelected: (vehicles: IVehicle[]) => void;
}

export const useMapStore = create<MapStore>((set) => ({
    vehiclesSelected: [],
    setVehiclesSelected: (vehicles) => set({ vehiclesSelected: vehicles }),
}));
