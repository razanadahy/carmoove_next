"use client"

import { motion } from "framer-motion";
import ParkingList from "./parking/ParkingList";
import EquipmentList from "./equipment/EquipmentList";

export default function AutoPartageSetting() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0 }}
            className="setting-section"
        >
            <div className="parking-available-list-box mb-5">
                <h2 className="mb-3">Stationnements disponibles</h2>
                <ParkingList />
            </div>

            <div className="equipement-list-box">
                <h2 className="mb-3">Équipements disponibles</h2>
                <EquipmentList />
            </div>
        </motion.div>
    );
}
