import React, {useEffect, useState} from "react";
import { Teban } from "shogitter-ts/lib/Teban";

const Share = ({role, tokens}) => {
    const [currentUrl, setCurrentUrl] = useState("");
    useEffect(() => {
        setCurrentUrl(location.href);
    });
    return <>
        <h2>🔗 Share</h2>
        <ul style={{listStyle: "none", paddingLeft: "10px"}}>
            <li>👀 watch <input value={`${currentUrl}#`} size={50} readOnly style={{maxWidth: "80%"}}/></li>
            {role === "owner" && <>
                <li>✍️️ edit <input value={`${currentUrl}/edit/${tokens.edit}`} size={50} readOnly
                                   style={{maxWidth: "80%"}}/></li>
                <li style={{opacity: "0.3"}}>🤝 play
                    <ul>
                        <li>{Teban.getMark(0)} <input value={`#under-construction`} size={50} readOnly
                                   style={{maxWidth: "80%"}}/></li>
                        <li>{Teban.getMark(1)} <input value={`#under-construction`} size={50} readOnly
                                   style={{maxWidth: "80%"}}/></li>
                    </ul>
                </li>
            </>}
        </ul>
    </>
}
export default Share;