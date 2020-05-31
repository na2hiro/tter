import {FunctionComponent, useState} from "react";

type Props = {
    initialValue: string;
    onSave: (value: string) => Promise<void>;
}

enum Status {
    NONE,
    SUBMITTING,
    FAILED,
}

const AutoSavingInput: FunctionComponent<Props> = ({initialValue, onSave}) => {
    const [value, setValue] = useState(initialValue);
    const [changed, setChanged] = useState(false);
    const [status, setStatus] = useState(Status.NONE);

    const save = async (e) => {
        if (!changed) return;
        try {
            setStatus(Status.SUBMITTING);
            await onSave(value)
            setStatus(Status.NONE);
            setChanged(false);
        } catch (e) {
            setStatus(Status.FAILED);
        }
    };

    return <form style={{display: "inline"}} onSubmit={(e)=>{e.preventDefault(); save(e)}}>
        <input type="text" value={value} onChange={(e) => {
            setValue(e.target.value)
            setChanged(true);
        }} onBlur={save}
               disabled={status == Status.SUBMITTING}/>
        {status == Status.FAILED && <button onClick={save}>retry</button>}
    </form>;
}

export default AutoSavingInput;