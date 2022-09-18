import { listen, UnlistenFn, emit } from '@tauri-apps/api/event';
import React, { RefObject, useEffect, useRef, useState } from "react";
import { ContentEditableEvent } from "react-contenteditable";
import PastIcon from "../../icons/PastIcon";
import Global from "../../styledcomponent";
import { readText } from '@tauri-apps/api/clipboard';
import { checkemails, fastcheckemails, notify, sleep, stop_for_loop } from "../../tools";
import { useFetching } from "../../hooks/fetcher";
import styled, { StyledComponent } from "styled-components";
import { random } from 'lodash';
import { pathsemailssmy, pathsettingsmy, unlistner } from '../../tools/catch';
import { Store } from 'tauri-plugin-store-api';
import { animated, AnimatedComponent, easings, useSpring } from 'react-spring';
import { useNavigate } from 'react-router-dom';

const CloseBtn = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: #fff;
  font-size: 1.2em;
  font-weight: bolder;
  padding: unset;
  margin: unset;
  text-align: center;
  text-justify: auto;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  right: -10px;
  top: -10px;
  cursor: pointer;
  background-color: red;
`;


const Confirm = styled.div`
  width: 250px;
  height: 40px;
  border-radius: 35px;
  background-color: #24bf33;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  text-align: center;
  line-height: 2em;
  user-select: none;
  cursor: pointer;
  transition: all ease-in-out 200ms;
  transform: scale(1);
  :active {
    transform: scale(.98);
  }
`;


const InnerPopup = styled(animated.div)`
  width: 80%;
  height: 180px;
  position: relative;
  background-color: #fff;
  border-radius: 20px;
  display: flex;
  z-index: 999;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  gap: 2em;
  margin: 300px auto 0px auto;
`;


const Popup = styled(animated.div)`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  backdrop-filter: blur(20px);
  background-color: #00000044;
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
`;


const CollectionName = styled.input`
  width: 350px;
  height: 40px;
  outline: unset;
  border: unset;
  font-size: 17px;
  background-color: #f1f1f1;
  border-radius: 20px;
  padding: 0px 1.5em;
  color: #000;
  margin-top: 2em;
`;

const SettingsDB = new Store(pathsettingsmy.value);
const EmailsDB = new Store(pathsemailssmy.value);
export default function AddPage(props: any) {
    const [listemails, setListEmails] = useState<string>("");
    const [thisunlisten, setunlisten] = useState<UnlistenFn>(null as any);
    const [isloading, setLoading] = useState(false);
    const [validlistemails, setValidListEmails] = useState<any[]>([]);
    const [validlist, setValidList] = useState<any[]>([]);
    const [progress, SetProgress] = useState(0);
    const [perscentage, setPercentage] =  useState(0);
    const [confirm, SetConfirme] = useState(false);
    const [COLLECTION_NAME, setCOLLECTION_NAME] = useState("");
    const [done, SetDone] = useState(false);
    const popup_container = useRef<RefObject<HTMLDivElement>|any>(null)
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
    const animation = useSpring({
        display: confirm ? "block": "none",
        opacity: confirm ?  1 : 0,
        config:{
            clamp:true,
            easing: easings.linear
        }
    });
    const animation1 = useSpring({
        transform: `scale(${confirm ?  1 : .9})`,
        config:{
            clamp:true,
            easing: easings.linear
        }
    });
    // let match = new RegExp(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,5}\b/gi);
    let match = new RegExp(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]{1,61}\.[A-Z]{2,5}\b/gi);
    // let match = new RegExp(/([a-zA-Z0-9_.-]+(?=@))+(?:@)+([a-zA-Z0-9_.-])+(?=[^a-zA-Z0-9_.-])/gi);
    const past = () => {
        readText().then(async (text) => {
            stop_for_loop(true)
            setSaving(false)
            // console.log(text);
            let pasted_emails = Array.from(String(text || "").matchAll(match)).map(s => s[0]);
            if(!pasted_emails || !pasted_emails[0]) return alert("No row emails in clipboard memory")
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
            // var r = await EmailsDB.get("last_checked_emails_html") as string;
            // var ri = 0;
            await emit('checkemails', {
                emails: reslist || [""], 
                sender: settings.sender, 
                proxyurl: settings.proxyurl, 
                smtptimout: settings.smtptimout
            });
            // for (const part of reslist) {
                
                // await checkemails({
                //     emails: part || [""], 
                //     sender: settings.sender, 
                //     proxyurl: settings.proxyurl, 
                //     smtptimout: settings.smtptimout
                // }).then(async (reachable)=>{
                //     // setValidListEmails(s=>s?.concat(reachable).map(s=>s));
                //     // for (const element of reachable) {
                //     //     r = r?.replace(element.email,`<p class="validation-${element.status}">${element.email}</p>`);
                //     //     setListEmails(r);
                //     //     if(r != ""){
                //     //         await EmailsDB.set("last_checked_emails_html", r);
                //     //         await EmailsDB.save()
                //     //     }
                //     //     await sleep(300)
                //     // }
                //     // setListEmails(reachable.map(element=>`<p class="validation-${element.status}">${element.email}</p>`).join(" - "));
                // }).catch((err)=>{
                //     console.log(err);
                // })
                // .finally(()=>{
                //     console.log("job done!");
                // })
            //     await sleep(500)
            //     if(ri >= reslist.length-1){
            //         setLoading(false)
            //         setSaving(true)
            //     }
            //     ri++
            // }
    }
    const save = async ()=>{
        var list = await EmailsDB.get("valid_emails") as any[] || [];
        if(list && list.length > 0){
            SetConfirme(true)
        } else {
            alert("no Collection!");
        }
        // setSaving(false)
    }
    let _navigator = useNavigate();
    const confirme = async (name?:string)=>{
        if(name || COLLECTION_NAME){
            if (validlistemails.length > 0){
                await EmailsDB.set("saved_"+Date.now(), { list: validlistemails, name: name ? name : COLLECTION_NAME });
                await EmailsDB.save();
                await notify("Collection","Saved");
                _navigator("/Package")
            } else {
                var list = await EmailsDB.get("valid_emails") as any[] || [];
                if(list.length == 0){
                    await notify("Collection","Collection no collection to save!");
                }
                await EmailsDB.set("saved_"+Date.now(), { list: list, name: name ? name : COLLECTION_NAME });
                await EmailsDB.save();
                await notify("Collection","Saved");
                _navigator("/Package")
            }
        } else {
            await notify("Collection","Collection name required!");
        }
        // setSaving(false)
    }
    useEffect(()=>{
        // EmailsDB.keys().then((key)=>{
        //     console.log(key)
        // });
        (async ()=>{
            EmailsDB.load().then(async ()=>{
                let allhtml = await EmailsDB.get("last_checked_emails_html") as any;
                if(allhtml && !listemails){
                    setListEmails(allhtml)
                    setSaving(true)
                }
            })
            getsettings().then(()=>{
                console.log("settings loaded!");
            })
            const unlisten = await listen<any>('next_pack', async (event) => {
                // console.log(`event.payload:${event.payload[0]}`);
                setLoading(true)
                var r = await EmailsDB.get("last_checked_emails_html") as string;
                var list = await EmailsDB.get("valid_emails") as any[] || [];
                let reachable = event.payload;
                setValidListEmails(s=>s?.concat(reachable).map(s=>s));
                setPercentage(s=>{
                    let all = r.split(" ").length;
                    let valid = list.length;
                    return (valid/all)*100
                })
                list=list.concat(reachable).map((s: any)=>s);
                if(list) await EmailsDB.set("valid_emails", list);
                for await (const element of reachable) {
                    r = r?.replace(element.email,`<p class="validation-${element.status}">${element.email}</p>`);
                    setListEmails(r);
                    if(r != ""){
                        await EmailsDB.set("last_checked_emails_html", r);
                    }
                }
                await EmailsDB.save()
              });
              const unlistenjob_done = await listen<any>('job_done', async (event) => {
                    setLoading(false)
                    setSaving(true)
                    unlisten()
                    unlistenjob_done()
                    SetDone(S=>!S)
              });
              // setunlisten(unlisten);
              // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
        })()
        // return ()=>{
        //     thisunlisten();
        // }
        SetConfirme(false)
    }, [done])
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
            {!isloading ?<Global.Cbutton
                loading={isloading ? 1 : 0}
                onClick={past}
                percentage={20}
                style={{
                    // backgroundColor: isloading ? "linear-gradient(180deg, #85C008 0%, #114353 100%)":"linear-gradient(180deg, #175A6F 0%, #114353 100%)",
                    alignSelf: "flex-end"
                }} 
                width={250} 
                fontsize={20} 
            >{isloading ? "Loading" : "Past"}{!isloading && <PastIcon width={20} />}</Global.Cbutton>:
            <Global.SaveBtn
                loading={isloading ? 1 : 0}
                onClick={()=>stop_for_loop(false)}
                percentage={20}
                style={{
                    // backgroundColor: isloading ? "linear-gradient(180deg, #85C008 0%, #114353 100%)":"linear-gradient(180deg, #175A6F 0%, #114353 100%)",
                    alignSelf: "flex-end"
                }} 
                width={250} 
                fontsize={20} 
            >Stop {perscentage > 0 ? perscentage+"%" : ""}</Global.SaveBtn>}
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
            <Popup ref={popup_container} style={animation} >
                <InnerPopup style={animation1} >
                    <CloseBtn 
                    onClick={()=>{
                        SetConfirme(false)
                    }}
                    >
                        x
                    </CloseBtn>
                    <CollectionName
                        onKeyUp={(ev)=>{
                            if (ev.key == "Enter"){
                                sleep(500).then(()=>{
                                    confirme(COLLECTION_NAME)
                                })
                            }
                        }}
                        value={COLLECTION_NAME} type="text" 
                        placeholder="COLLECTION NAME" onChange={(v)=>{
                        v.preventDefault()
                        setCOLLECTION_NAME(v.currentTarget.value)
                    }} />
                    <Confirm onClick={()=>{
                        confirme()
                    }} >
                        confirme
                    </Confirm>
                </InnerPopup>
            </Popup>
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