import { listen } from '@tauri-apps/api/event';
import React, { useEffect, useState } from "react";
import { ContentEditableEvent } from "react-contenteditable";
import PastIcon from "../../icons/PastIcon";
import Global from "../../styledcomponent";
import { readText } from '@tauri-apps/api/clipboard';
import { checkemails, EmailsDB, fastcheckemails, SettingsDB, sleep } from "../../tools";
import { useFetching } from "../../hooks/fetcher";
import styled from "styled-components";
export default function AddPage(props: any) {
    // console.log("AddPage");
    const [listemails, setListEmails] = useState<string>("");
    const [thisunlisten, setunlisten] = useState<any>(null);
    const [isloading, setLoading] = useState(false);
    const [validlistemails, setValidListEmails] = useState<any[]>([]);
    const [validlist, setValidList] = useState<any[]>([]);
    const [progress, SetProgress] = useState(0);
    const [is_saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<{
        sender: null | string,
        proxyurl: null | string,
        proxyactive: null | boolean,
        concurance: null | number,
        smtptimout: null | number,
        key:null | string
    }>({
        sender: null,
        proxyurl: null,
        proxyactive: null,
        concurance: null,
        smtptimout: null,
        key:null
    });
    let match = new RegExp(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,5}\b/gi);
    const past = () => {
        readText().then(async (text) => {
            // console.log(text);
            let pasted_emails = Array.from(String(text || "").matchAll(match)).map(s => s[0]);
            if(pasted_emails){
                await EmailsDB.set("last_checked_emails_html", Array.from(String(text || "")?.replace(/[,'"!`]/g, "").matchAll(match)).join(" "));
                await EmailsDB.save()
            }
            setListEmails(Array.from(String(text || "")?.replace(/[,'"!`]/g, "").matchAll(match)).join(" "))
            // console.log(Array.from(String(text||"").matchAll(match)));
            setLoading(true)
            partialcheck(pasted_emails||["test@example.dev"]);
        })
    }
    const getsettings = async () => {
        let settings = await SettingsDB.get("settings") as any
        // console.log(settings);
        if (settings) {
            setSettings(settings)
        }
    }
    const partialcheck = async (list: string[]) => {
        const n = settings.concurance || 10;
        let reslist = list?.reduce((r:any, e:any, i:number) =>
            (i % n ? r[r.length - 1].push(e) : r.push([e])) && r
            , []);
            var r = await EmailsDB.get("last_checked_emails_html") as string;
            var ri = 0;
            for (const part of reslist) {
                await checkemails({
                    emails: part || [""], 
                    sender: settings.sender, 
                    proxyurl: settings.proxyurl, 
                    smtptimout: settings.smtptimout
                }).then(async (reachable)=>{
                    setValidListEmails(s=>s?.concat(reachable).map(s=>s));
                    for (const element of reachable) {
                        r = r?.replace(element.email,`<p class="validation-${element.status}">${element.email}</p>`);
                        setListEmails(r);
                        if(r != ""){
                            await EmailsDB.set("last_checked_emails_html", r);
                            await EmailsDB.save()
                        }
                        await sleep(300)
                    }
                    // setListEmails(reachable.map(element=>`<p class="validation-${element.status}">${element.email}</p>`).join(" - "));
                }).catch((err)=>{
                    console.log(err);
                })
                .finally(()=>{
                    console.log("job done!");
                })
                await sleep(500)
                if(ri >= reslist.length-1){
                    setLoading(false)
                    setSaving(true)
                }
                ri++
            }
    }
   

    const save = ()=>{
        EmailsDB.set("saved_"+Date.now(), validlistemails);
        // console.log(EmailsDB.keys);
        EmailsDB.save();
        setSaving(false)
    }
    useEffect(()=>{
        (async ()=>{
            EmailsDB.load().then(async ()=>{
                let allhtml = await EmailsDB.get("last_checked_emails_html") as any;
                if(allhtml && !listemails){
                    setListEmails(allhtml)
                }
            })
            getsettings().then(()=>{
                console.log("settings loaded!");
            })
            const unlisten = await listen<string>('error', (event) => {
                console.log(`Got error in window ${event.windowLabel}, payload: ${event.payload}`);
              });
            setunlisten(unlisten);
              // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
        })()
        // return ()=>{
        //     thisunlisten();
        // }
    }, [])
    return (
        <Global.Cbody>
            <Global.Cinput
                onChange={(evt: ContentEditableEvent) => false}
                disabled={true}
                onPaste={(e) => e.preventDefault()}
                html={listemails}
                tagName='article'
            />
            <BtnsGroups>
            <Global.Cbutton
                loading={isloading ? 1 : 0}
                onClick={past}
                percentage={20}
                style={{
                    // backgroundColor: isloading ? "linear-gradient(180deg, #85C008 0%, #114353 100%)":"linear-gradient(180deg, #175A6F 0%, #114353 100%)",
                    alignSelf: "flex-end"
                }} 
                width={250} 
                fontsize={20} 
            >{isloading ? "Loading" : "Past"}{!isloading && <PastIcon width={20} />}</Global.Cbutton>
            {is_saving && <Global.SaveBtn
                loading={isloading ? 1 : 0}
                onClick={save}
                percentage={20}
                style={{
                    // backgroundColor: isloading ? "linear-gradient(180deg, #85C008 0%, #114353 100%)":"linear-gradient(180deg, #175A6F 0%, #114353 100%)",
                    alignSelf: "flex-end"
                }} 
                width={250} 
                fontsize={20} 
            >{"Save"}</Global.SaveBtn>}
            </BtnsGroups>
        </Global.Cbody>
    )
}



const BtnsGroups =  styled.div`
    display:flex;
    flex-direction:row;
    justify-content:center;
    align-items:center;
    width: 100%;
    height: auto;
    align-self:end;
`;
// karentaikan@gmail.com _ learpaerit@gmail.com _ bekeirleravi@gmail.com _ reafbering@gmail.com _ freadyeart@gmail.com _ luiskollaa@gmail.com _ nnoellduroo@gmail.com _ noelekarel@gmail.com _ carminekazmierczakeeza@gmail.com _ catheybolandacaa@gmail.com _ richardashrhsa@gmail.com _ jimmylakemmee@gmail.com _ amyschlemmeryarc@gmail.com _ jeffreyreissefre@gmail.com _ kimberlylawsmmwa@gmail.com _ dustingolstoniuto@gmail.com

// kimberlylawsmmwa@gmail.com - amyschlemmeryarc@gmail.com - catheybolandacaa@gmail.com