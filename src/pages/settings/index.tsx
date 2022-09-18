import React, { FC, useContext, useEffect, useMemo, useState } from "react";
// import Database from "tauri-plugin-sql-api";
import { checkemails, notify } from "../../tools";
import styled from "styled-components";
import { MenuContext } from "../../hooks";
import Global from "../../styledcomponent";
import { pathsettingsmy, pathsemailssmy } from "../../tools/catch";
import { Store } from "tauri-plugin-store-api";
const SettingsDB = new Store(pathsettingsmy.value);
const EmailsDB = new Store(pathsemailssmy.value);
export default ({ ...props }) => {
    const [loaded, setLoaded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        sender: null,
        proxyurl: null,
        smtptimout: 300,
        proxyactive: false,
        concurance: 2,
        key: ""
    })
    const { menu } = useContext(MenuContext)
    const validation = async () => {
        var status = { email: true, proxy: true }
        if (settings.sender) {
            let reachable = await checkemails({
                emails: [settings.sender],
                sender: settings.sender,
                proxyurl: settings.proxyurl,
                smtptimout: settings.smtptimout,
            } as any);
            if (!(reachable[0].status == "Safe" || reachable[0].status == "Risky")) {
                status.email = false
            }
        } else {
            status.email = false
        }
        if (settings.proxyactive) {
            let proxy_match = String(settings.proxyurl || "")?.match(/(?:socks5:\/\/)(.+?(?=:))(?::)(.+?(?=@))(?:@)(.+?(?=:))(?::)([0-9]{3,5})/);
            if (!proxy_match || proxy_match.length != 5) {
                status.proxy = false
            }
        }
        return status;
    }
    useEffect(() => {
        menu.isopen = false
        SettingsDB.load().then(() => {
            getsettings().then(() => {
                setLoaded(true)
            })
        }).catch(err => {
            setLoaded(true)
            notify("notice: ", err)
        });
        return () => setLoaded(false);
    }, [])
    const save = async () => {
        let status = await validation();
        if(status.email && status.proxy){
            setIsSaving(true)
            await SettingsDB.set("settings", settings)
            await SettingsDB.save()
            setIsSaving(false)
            await notify("settings", `Saved`)
        } else {
            await notify("settings", `could not save before checking your: ${!status.email ? "email": "proxy_url"}`)
        }
    }
    const getsettings = async () => {
        let settings = await SettingsDB.get("settings") as any
        // console.log(settings);
        if (settings) {
            setSettings(settings)
        }
    }
    return loaded && (
        <Wrapper>
            <Title>Settings:</Title>
            <Argument>
                <span style={{
                    color: "#000"
                }}>
                    Sender:
                </span>
                <Input type={"text"} value={String(settings.sender || "")} placeholder="Sender: example@domain.com" onChange={(m) => {
                    m.preventDefault()
                    let el = m.nativeEvent.target as any;
                    setSettings(s => ({ ...s, sender: el?.value }))
                }} />
            </Argument>
            <Argument>
                <span style={{
                    color: "#000"
                }}>
                    concurance : <kbd>{settings.concurance}</kbd>
                </span>
                <Input type={"range"} min="1" max="20" onChange={(m) => {
                    m.preventDefault()
                    let el = m.nativeEvent.target as any;
                    setSettings(s => ({ ...s, concurance: el?.valueAsNumber }))
                }}
                    value={settings.concurance}
                    step="1" placeholder="concurance: max - 5 | min - 1" />
            </Argument>
            <Argument>
                <span style={{
                    color: "#000"
                }}>
                    smtp timeout: <kbd>{settings.smtptimout}</kbd>
                </span>
                <Input type={"range"} min="100" max="1000" name="smtptimeout" onChange={(m) => {
                    m.preventDefault()
                    let el = m.nativeEvent.target as any;
                    setSettings(s => ({ ...s, smtptimout: el?.valueAsNumber }))
                }} value={settings.smtptimout} step="50" placeholder="timeout: max - 1000ms | min - 100ms" />
                <output htmlFor="smtptimeout" aria-valuetext={String(settings.smtptimout)} ></output>
            </Argument>
            <Argument>
                <span style={{
                    color: "#000"
                }}>
                    Proxy:
                </span>
                <GroupInputs>
                    {
                        settings.proxyactive && <Input type={"text"} disabled={!settings.proxyactive} onChange={(m) => {
                            let el = m.nativeEvent.target as any;
                            setSettings(s => ({ ...s, proxyurl: el.value }))
                        }}
                            formNoValidate={true}
                            value={String(settings.proxyurl || "")}
                            placeholder="url:socks5://username:pass@host:port " />
                    }
                    <Checkbox checked={settings.proxyactive} type={"checkbox"} onChange={(m) => {
                        setSettings(s => ({ ...s, proxyactive: (m.nativeEvent.target as any)?.checked }))
                    }} />
                </GroupInputs>
            </Argument>
            <Argument>
                <span style={{
                    color: "#000"
                }}>
                    keygen:
                </span>
                <GroupInputs>
                    <Input type={"text"} onChange={(m) => {
                        let el = m.nativeEvent.target as any;
                        setSettings(s => ({ ...s, proxyurl: el.value }))
                    }}
                        formNoValidate={true}
                        value={String(settings.proxyurl || "")}
                        placeholder="xxxxxxxxxxxxxxxxxxxxxxxxx" />
                </GroupInputs>
            </Argument>
            <Global.Cbutton
                onClick={save}
                percentage={30}
                style={{
                    alignSelf: "flex-end",
                    marginTop: 40
                }} width={250} loading={0} fontsize={20} >{"Save"}</Global.Cbutton>
        </Wrapper>
    )
}
// 
const Checkbox = styled.input`
    width: 25px;
    height: 25px;
    :active {
        color: #00ff33;
    }
`;
const Wrapper = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    background-color: #ffffff59;
    flex-direction: column;
    justify-content: baseline;
    align-items: baseline;
    padding: .2em 1em;
`;
const GroupInputs = styled.div`
    flex: 3;
    display: flex;
    flex-direction: row;
    align-items: center;
`;
const Argument = styled.div`
    background-color: #f7f7f7;
    width: 90%;
    height: 30px;
    max-height: 50px;
    align-self: center;
    display: flex;
    flex-direction: row;
    border-radius: 30px;
    /* justify-content: center; */
    /* align-items: center; */
    margin-top: 2em;
    padding: .6em;
    span {
        user-select: none;
        flex: 1;
        cursor: pointer;
        align-self: center;
        justify-self: center;
        font-size: 14px;
        text-align: left;
        kbd {
            font-size: 10px;
            background-color: #363636;
            padding: 2px 3px;
            border-radius: 10px;
            color: #fff;
        }
    }
`;
const Input = styled.input`
    outline: unset;
    padding: .5em;
    flex: 3;
    border-radius: 20px;
    margin: 1em .5em;
    align-self: center;
    justify-self: center;
    font-size: 16px;
    width: 70%;
    height:  100%;
    border: unset;
`;
const Title = styled.h3`
    font-family:"Josefin Sans";
    color: #fff;
    margin-left: 1em;
`;