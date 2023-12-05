import Select, { components } from 'react-select';
import Twemoji from 'react-twemoji';
import { twemojiOptions } from '../Helpers/TwemojiHelper';

const SingleValue = ({
    children,
    ...props
}) => (
    <components.SingleValue {...props}><Twemoji options={twemojiOptions}>{children}</Twemoji></components.SingleValue>
);

const Option = (props) => {
    return (
        <Twemoji options={twemojiOptions}><components.Option {...props} /></Twemoji>
    );
};

function AutoSelect({ options, onChange, placeholder, defaultValue, className, neverChange = false }) {
    const theme = (theme) => ({
        ...theme,
        colors: {
            ...theme.colors,
            neutral0: "#111",
            neutral5: "#222",
            neutral10: "#333",
            neutral20: "#444",
            neutral30: "#555",
            neutral40: "#666",
            neutral50: "#777",
            neutral60: "#888",
            neutral70: "#999",
            neutral80: "#AAA",
            neutral90: "#BBB",
            primary: "#44A",
            primary75: "#228",
            primary50: "#225",
            primary25: "#224"
        },
    });
    return (
        <Select
            components={{ SingleValue, Option }}
            options={options}
            defaultValue={defaultValue}
            placeholder={placeholder}
            onChange={(newValue) => onChange(newValue?.value)}
            isClearable
            theme={theme}
            styles={{
                menu: (styles) => ({ ...styles, marginTop: 0 })
            }}
            className={className}
            value={neverChange ? null : undefined}
        />
    );
}

export default AutoSelect;
