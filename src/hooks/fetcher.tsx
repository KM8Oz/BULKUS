import { Any } from "@react-spring/types";
import React, { useContext, useEffect, useState } from "react";
import { checkemails, SettingsDB } from "../tools";
export interface exportedFetchedContex { fetched: any[] ,setFetching: React.Dispatch<React.SetStateAction<any[]>> };
const FetchingContext = React.createContext<exportedFetchedContex>([] as any);

const FetchingProvider = (props:any) => {
    const [fetching, setFetching] = useState([]);
    const [fetched, setFetched] = useState<any[]>([]);
    useEffect(()=>{
        (async ()=>{
        let settings = await SettingsDB.get("settings") as any
        await checkemails({
            emails: fetching || [""], 
            sender: settings.sender, 
            proxyurl: settings.proxyurl, 
            smtptimout: settings.smtptimout
        }).then(async (reachable)=>{
            setFetched(reachable)
        })
        })()
    },[fetching]);
    const value = {
        fetched,
        setFetching
    }
    return <FetchingContext.Provider value={value} {...props} />
}

export const useFetching = () => useContext(FetchingContext)