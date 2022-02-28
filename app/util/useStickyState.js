import { useState } from "react";

export function useStickyState(defaultValue, key) {
    // const [value, setValue] = React.useState(() => {
    //     const stickyValue = window.localStorage.getItem(key);
    //     return stickyValue !== null
    //         ? JSON.parse(stickyValue)
    //         : defaultValue;
    // });

    // React.useEffect(() => {
    //     window.localStorage.setItem(key, JSON.stringify(value));
    // }, [key, value]);
    const [value, setValue] = useState(defaultValue) // TODO: fiks

    return [value, setValue];
}
