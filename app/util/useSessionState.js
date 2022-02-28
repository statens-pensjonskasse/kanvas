import { useState } from "react";

export function useSessionState(defaultValue, key) {
    // const [value, setValue] = React.useState(() => {
    //     const stickyValue = window.sessionStorage.getItem(key);
    //     return stickyValue !== null
    //         ? JSON.parse(stickyValue)
    //         : defaultValue;
    // });

    // React.useEffect(() => {
    //     window.sessionStorage.setItem(key, JSON.stringify(value));
    // }, [key, value]);
    const [value, setValue] = useState(defaultValue) //TODO: fiks

    return [value, setValue];
}
