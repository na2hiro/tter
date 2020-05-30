import axios from "axios";
import {useRouter} from "next/router";
import {useState} from "react";

const CreateNewRoom = () => {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    return (
        <button onClick={async () => {
            setSubmitting(true);
            try {
                const response = await axios.post<{ roomId: number }>("/api/new");
                router.push(`/${response.data.roomId}`);
            } catch (e) {
                setSubmitting(false)
            }
        }} disabled={submitting}>Create a new room</button>
    )
}

export default CreateNewRoom;