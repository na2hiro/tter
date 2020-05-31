import React, {useEffect, useRef, useState} from "react";
import { Teban } from "shogitter-ts/lib/Teban";
import CopyToClipboard from 'react-copy-to-clipboard';

const CopyableInput = ({value}) => {
    const [copied, setCopied] = useState(false);
    const ref = useRef<HTMLInputElement>();
    return <>
        <CopyToClipboard text={value} onCopy={() => {setCopied(true); ref?.current?.select(); }}>
            <input value={value} size={27} readOnly style={{maxWidth: "80%"}} ref={ref} onBlur={() => setCopied(false)}/>
        </CopyToClipboard> {copied && "Copied!"}
    </>
}

const Share = ({role, tokens}) => {
    const [currentUrl, setCurrentUrl] = useState("");
    useEffect(() => {
        setCurrentUrl(location.href);
    });
    return <>
        <h2>🔗 Share</h2>
        <ul style={{listStyle: "none", paddingLeft: "10px"}}>
            <li>👀 watch <CopyableInput value={`${currentUrl}`} /></li>
            {role === "owner" && <>
                <li>✍️️ edit <CopyableInput value={`${currentUrl}/edit/${tokens.edit}`} /></li>
                <li style={{opacity: "0.3"}}>🤝 play
                    <ul>
                        <li>{Teban.getMark(0)} <input value={`#under-construction`} size={27} readOnly
                                   style={{maxWidth: "80%"}}/></li>
                        <li>{Teban.getMark(1)} <input value={`#under-construction`} size={27} readOnly
                                   style={{maxWidth: "80%"}}/></li>
                    </ul>
                </li>
            </>}
        </ul>
    </>
}
export default Share;