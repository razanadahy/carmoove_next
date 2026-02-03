import { Typography } from "antd";
import CarmooveButton from "@/components/Common/CarmooveButton";
import './Tutorial.css'
export default function Tutorial() {
    return (
        <div className="tutorial-box">
            <h3>Pour prendre en main l’application</h3>
            <Typography>
                Si vous avez besoin d’informations sur la prise en main des fonctionnalités
                de l’application, n’hésitez pas à consulter nos tutoriels vidéos.
            </Typography>
            <CarmooveButton
                htmlType='button'
                onClick={() => { window.open("https://www.carmoove.com/tutoriels-application-web-de-gestion-de-flotte/", "_blank") }}
            >
                VOIR LES TUTORIELS
            </CarmooveButton>
        </div>
    )
}
