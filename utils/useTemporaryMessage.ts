import {useCallback, useState} from "react";

const useTemporaryMessage: (millis: number) => [string, (message: string) => void] = (millis) => {
    const [message, setMessage] = useState("");
    const [callback, setCallback] = useState<NodeJS.Timeout | null>(null);
    const setTemporaryMessage = useCallback((message) => {
        setMessage(message);
        if(callback) {
            clearTimeout(callback);
        }
        setCallback(setTimeout(() => {
            setMessage("");
            setCallback(null);
        }, millis));
    }, [callback])

    return [message, setMessage];
}

export default useTemporaryMessage;