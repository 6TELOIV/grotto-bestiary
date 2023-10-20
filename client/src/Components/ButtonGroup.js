import { isArray } from "lodash";
import "./ButtonGroup.css";

function ButtonGroup({ options, onSelect, selected, disabled = [] }) {
    return (
        <div className="button-group">
            {options.map((options) => {
                let isSelected = selected === options.value;
                if (isArray(selected)) {
                    isSelected = selected.includes(options.value);
                }
                return (
                    <div key={options.value}>
                        <input
                            type="checkbox"
                            id={options.value}
                            checked={isSelected}
                            onChange={() => onSelect(options.value)}
                            disabled={disabled.includes(options.value)}
                        />
                        <label htmlFor={options.value}>{options.label ?? options.value.charAt(0).toUpperCase() + options.value.slice(1)}</label>
                    </div>
                );
            })}
        </div>
    );
}

export default ButtonGroup;
