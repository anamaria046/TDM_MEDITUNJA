import Logo from "../../assets/Logo.png"
import styles from "./Brand.module.css"

function Brand(){
    return(
        <div className={styles.brand}>
            <img src={Logo} alt="log" />
            <span>MediTunja</span>
        </div>
    );
}

export default Brand;