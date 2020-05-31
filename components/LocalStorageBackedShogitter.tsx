import React from "react";
import {ShogitterWithoutDnDWrapper} from "shogitter-react";
import Shogi from "shogitter-ts";
import {useState} from "react";

const LocalStorageBackedShogitter = () => {
    const [shogitter, setShogitter] = useState(() => {
        let shogi;
        try{
            const data = JSON.parse(localStorage.getItem("home-shogi"));
            shogi = new Shogi(data);
        } catch (e) {
            shogi = new Shogi(0);
            shogi.start();
        }
        return shogi;
    });
    const [data, setData] = useState(shogitter.getObject());

    return (
        <ShogitterWithoutDnDWrapper config={{publicPath: "/sh-react", allowSpeculative: true}} data={data} onCommand={(command)=>{
            let data;
            try {
                shogitter.runCommand(command);
                data = shogitter.getObject();
                setData(data);
                try{
                    localStorage.setItem("home-shogi", JSON.stringify(data));
                } catch (e) {

                }
            }catch(e) {
                alert(e);
                console.error(e);
                // When error occurs, shogitter is broken. (i.e. move is not an atomic operation) Need to recreate.
                setShogitter(new Shogi(data));
            }
        }} />
    );
}

export default LocalStorageBackedShogitter;