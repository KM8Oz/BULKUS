import React, { FC, Suspense, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import Global from "../../styledcomponent";
import { useSprings, animated, config } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { clamp } from 'lodash'
// import swap from 'lodash-move'
import { EmailsDB, export_to_exel, notify, sleep } from "../../tools";
import { useSpring } from "react-spring";
import { PieChart } from 'react-minimal-pie-chart';
import ReactJson from 'react-json-view'
import { save } from '@tauri-apps/api/dialog';
import { downloadDir } from "@tauri-apps/api/path";
const to_object = (json: any) => {
    try {
        return JSON.parse(json)
    } catch (error) {
        return {}
    }
}
export default function PackagePage(props: any) {
    const [list, setlist] = useState<any[]>([]);
    const [show, setShow] = useState(false);
    useEffect(() => {
        EmailsDB.load().then(async () => {
            let keys = await EmailsDB.keys();
            var i = 0;
            for await (const key of keys) {
                let parsed = key.match(/(?:saved_)([0-9]+)/) as any;
                if (parsed && parsed.length == 2) {
                    // console.log(parsed[1]);
                    let object = await EmailsDB.get(key) as any[];
                    let list = object.map(s => {
                        try {
                            let ob = JSON.parse(s.data)
                            if (ob) {
                                return ob
                            } else {
                                return null
                            }
                            // ?.is_reachable
                        } catch (error) {
                            return null
                        }
                    });
                    let objects = object.map(s => ({ ...s, data: to_object(s.data) }));
                    // console.log(objects); //is_reachable
                    let invalid = list.reduce((n, e) => e.is_reachable === 'invalid' ? n + 1 : n, 0);
                    let safe = list.reduce((n, e) => e.is_reachable === 'safe' ? n + 1 : n, 0);
                    let risky = list.reduce((n, e) => e.is_reachable === 'risky' ? n + 1 : n, 0);
                    let date = new Date(Number(parsed[1])).toLocaleString()
                    if (object) {
                        // const falseNb = object.data.reduce((n, e) => e.status === 'false' ? n+1 : n, 0);
                        setlist(s => s.concat([{ date, object: objects, ...{ invalid, safe, risky } }]).map(e => e))
                    }
                }
                if (i >= keys.length - 1) {
                    setShow(true)
                }
                i++
                // await sleep(100)
            }

        })
        return () => {
            setlist([])
        }
    }, [])
    return (
        <Global.Cbody>
            {show ? <DraggableList items={list.map(s => (<Item {...s} />))} /> :
                <Global.Blocks style={{
                    margin: "3em 7em -2em auto"
                }} />
            }
        </Global.Cbody>
    )
}
const Item = ({ date, invalid, safe, risky, object }: { date: string, invalid: number, safe: number, risky: number, object: any }) => {
    const [droped, setDroped] = useState(false);
    const animatedStyled = useSpring({
        height: droped ? 470 : 0,
        marginTop: droped ? 12 : 0,
        // config: { frequency: 1, velocity: 1 }
    })
    const savefile = async ({ date, object }: any) => {
        let array = object?.map((s:any)=>([s?.email!, s?.status!,s?.data.mx.records.join("-")! ,String(s?.data.misc.is_disposable!||false)]));
        let dd = await downloadDir();
        const filePath = await save({
            defaultPath:dd,
            title: "Save summery |"+date,
            filters: [{
              name: 'ValidedExcelFormat_'+Date.now(),
              extensions: ['xlsx', 'csv']
            }]
          }); 
         export_to_exel(JSON.stringify({array, date, file_path:filePath})).then((s)=>{
            notify("Saved", "Success")
         })
    }
    return (
        <animated.div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            padding: ".6em .6em",
            cursor: "grab",
            overflowY: "scroll",
            borderRadius: 20,
            overflowX: "hidden",
            width: "96%",
            background: "#fff",
        }}>
            <div style={{
                width: "100%",
                height: "100%",
                maxHeight: 50,
                display: "flex",
                flex: 1,
                flexDirection: "row",
                flexWrap: "nowrap",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "unset",
            }}>
                <PieChart
                    style={{
                        width: 50,
                        height: 50
                    }}
                    data={[
                        { title: 'invalid', value: invalid, color: '#AE3737' },
                        { title: 'safe', value: safe, color: '#31B702' },
                        { title: 'risky', value: risky, color: '#D1CA23' },
                    ]}
                />
                <span style={{
                    fontSize: 14,
                    userSelect: "none"
                }}>
                    {
                        date
                    }
                </span>
                <>
                    <SaveIcn width={30} style={{
                        cursor: "pointer"
                    }}
                        onClick={() => savefile({ object, date })}
                    />
                    <Arrow onClick={() => setDroped(S => !S)}
                        style={{
                            cursor: "pointer",
                        }}
                        size={50} toggle={droped} />
                </>
            </div>
            <animated.div style={{
                ...animatedStyled,
                overflowY: "scroll",
                overflowX: "scroll",
                position: "relative",
                borderRadius: 15,
            }}>
                <ReactJson
                    src={object} theme={"ashes"}
                    iconStyle="triangle"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyItems: "baseline",
                        padding: "0px 5px",
                        borderRadius: 15
                    }}
                    enableClipboard indentWidth={5}
                    collapsed={false}
                    collapseStringsAfterLength={15}
                />
            </animated.div>
        </animated.div>
    )
}
const fn =
    (order: number[], active = false, originalIndex = 0, curIndex = 0, y = 0) =>
        (index: number) =>
            active && index === originalIndex
                ? {
                    y: curIndex * 100 + y,
                    scale: 1.01,
                    zIndex: 1,
                    shadow: 15,
                    immediate: (key: string) => key === 'zIndex',
                    config: (key: string) => (key === 'y' ? config.stiff : config.default),
                }
                : {
                    y: order.indexOf(index) * 100,
                    scale: 1,
                    zIndex: 0,
                    shadow: 1,
                    immediate: false,
                }
function DraggableList({ items }: { items: any[] }) {
    // const order = useRef(items.map((_, index) => index)) // Store indicies as a local ref, this represents the item order
    // const [springs, api] = useSprings(items.length, fn(order.current)) // Create springs, each corresponds to an item, controlling its transform, scale, etc.
    // const bind = useDrag(async ({ args: [originalIndex], active, movement: [, y] }) => {
    //     const curIndex = order.current.indexOf(originalIndex)
    //     const curRow = clamp(Math.round((curIndex * 250 + y) / 250), 0, items.length - 1)
    //     const newOrder = swap(order.current, curIndex, curRow)
    //     api.start(fn(newOrder, active, originalIndex, curIndex, y)) // Feed springs new style data, they'll animate the view without causing a single render
    //     if (!active) order.current = newOrder
    // })

    return (
        <Global.DraggableContent >
            {/* {springs.map(({ zIndex, shadow, y, scale }, i) => ( */}
            {items.map((item:any,i:number)=>
                <animated.div
                    // {...bind(i)}
                    key={i}
                    // style={{
                    //     zIndex,
                    //     boxShadow: shadow.to(s => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px`),
                    //     y,
                    //     scale,
                    // }}
                    children={item}
                />
            )}
            {/* ))} */}
        </Global.DraggableContent>
    )
}

function Arrow({ toggle, size, ...rest }: { toggle: boolean, size: number } & any) {
    // const animationProps = useAnimatedPath({ toggle });
    const { d } = useSpring({
        d: !toggle ? "M106 79.5L79.5 53 53 79.5M79.5 106V53" : "M53 79.5L79.5 106 106 79.5M79.5 53v53"
    });
    return (
        <animated.svg
            width={size || 159}
            height={size || 159}
            fill="none"
            viewBox={"0 0 159 159"}
            {...rest}
        >
            <animated.path
                d="M79.5 145.75c36.589 0 66.25-29.661 66.25-66.25S116.089 13.25 79.5 13.25 13.25 42.911 13.25 79.5s29.661 66.25 66.25 66.25z"
                stroke="#000"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <animated.path
                d={d}
                stroke="#000"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </animated.svg>
    );
}

function SaveIcn(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width={props.width || 49}
            height={props.width || 49}
            viewBox="0 0 49 49"
            fill="none"
            {...props}
        >
            <g clipPath="url(#prefix__clip0_215_109)">
                <path
                    d="M25.419 28.593V29.8l.854-.854 7.938-7.94a1.002 1.002 0 111.416 1.416l-10.5 10.5h0a.999.999 0 01-1.416 0h0l-10.5-10.5a1.004 1.004 0 01.325-1.634 1.001 1.001 0 011.091.217s0 0 0 0l7.938 7.941.854.854V6.713a5.5 5.5 0 015.5-5.5h13.5a5.5 5.5 0 015.5 5.5v36a5.5 5.5 0 01-5.5 5.5h-36a5.5 5.5 0 01-5.5-5.5v-36a5.5 5.5 0 015.5-5.5h7.5a1 1 0 110 2h-7.5a3.5 3.5 0 00-3.5 3.5v36a3.5 3.5 0 003.5 3.5h36a3.5 3.5 0 003.5-3.5v-36a3.5 3.5 0 00-3.5-3.5h-13.5a3.5 3.5 0 00-3.5 3.5v21.88z"
                    fill="#31B702"
                    stroke="#31B702"
                />
            </g>
            <defs>
                <clipPath id="prefix__clip0_215_109">
                    <path
                        fill="#fff"
                        transform="translate(.419 .714)"
                        d="M0 0h48v48H0z"
                    />
                </clipPath>
            </defs>
        </svg>
    );
}
