import styles from './Hero.module.css';

function HeroUser( {label, title, description} ) {
    return (
        <section className={styles.hero}>
            <span>{label}</span>
            <h1>{title}</h1>
            <p>{description}</p>
        </section>
    );
}

export default HeroUser;