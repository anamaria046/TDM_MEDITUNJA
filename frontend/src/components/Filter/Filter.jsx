import styles from "./Filter.module.css";

function Filter({
    id,
    searchValue,
    onSearchChange,
    searchLabel,
    searchPlaceholder,
    filterValue,
    onFilterChange,
    filterLabel,
    filterOptions,
}) {
    return (
        <section className={styles.container}>
            <div className={styles.formFilter}>
                <div className={styles.field}>
                    <label htmlFor={`${id}-search`}>{searchLabel}</label>
                    <input
                        id={`${id}-search`}
                        type="search"
                        value={searchValue}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder={searchPlaceholder}
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor={`${id}-filter`}>{filterLabel}</label>
                    <select
                        id={`${id}-filter`}
                        value={filterValue}
                        onChange={(event) => onFilterChange(event.target.value)}
                    >
                        {filterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </section>
    );
}

export default Filter