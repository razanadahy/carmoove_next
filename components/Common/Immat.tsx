import './immat.css';

function Immat(props: {registration: string, size?: string, blue?: Boolean, className?: String}) {
    return (
        <div className={`${props.className} immat ${props.size ? props.size : 'normal'}  ${props.blue ? 'blue' : ''}`}>
            <span>{props.registration}</span>
        </div>
    )
}

export default Immat;