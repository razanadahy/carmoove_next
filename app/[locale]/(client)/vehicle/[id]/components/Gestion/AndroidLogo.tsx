'use client'

import './AndroidLogo.css';

interface AndroidLogoProps {
    icon: string;
    h1: string;
    h2: string;
    link: string;
}

const AndroidLogo = ({ icon, h1, h2, link }: AndroidLogoProps) => {
    return (
        <a href={link} target="_blank" rel="noopener noreferrer" className="android-logo-container">
            <div className="android-logo-icon">
                <img src={icon} alt={h1} />
            </div>
            <div className="android-logo-text">
                <span className="android-logo-h2">{h2}</span>
                <span className="android-logo-h1">{h1}</span>
            </div>
        </a>
    );
};

export default AndroidLogo;
