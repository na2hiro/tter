import React, {useEffect, useState} from "react";

const Share = ({role, tokens}) => {
    const [currentUrl, setCurrentUrl] = useState("");
    useEffect(() => {
        setCurrentUrl(location.href);
    });
    return <>
    <h2>Share</h2>
        <ul>
            <li>Share to watch <input value={`${currentUrl}#`} size={50} readOnly style={{maxWidth: "80%"}} /></li>
            {role==="owner" &&
            <li>Share to edit <input value={`${currentUrl}/edit/${tokens.edit}`} size={50} readOnly style={{maxWidth: "80%"}} /></li>}
        </ul>
    </>
}
export default Share;