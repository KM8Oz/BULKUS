import { useContext, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
// import { appWindow } from '@tauri-apps/api/window'
import Global from "./styledcomponent"
import './App.css'
import SettingsIcon from './icons/settings'
import { Suspense } from 'react'
import {
  useRoutes,
  useNavigate,
  useLocation
} from 'react-router'
import routes from '~react-pages'
import { useDrag } from '@use-gesture/react'
import { useSpring } from 'react-spring'
import AddIcon from './icons/Addicon'
import HomeIcon from './icons/HomeIcon'
import TerminalIcon from './icons/terminalicon'
import PackageIcon from './icons/packageicon'
import useGlobalDOMEvents from './hooks/useglobalDomEvents'
import { MenuContext } from './hooks'
enum slided {
  left="left",
  right="right"
}
let MIDLENGHT = 400
function App() {
  // console.log(routes);
    let _navigator = useNavigate();
    const [is_online, setIsOnline] =  useState(false);
    let { menu } = useContext(MenuContext);
    // const [footerShow, setFooterShow] =  useState(slided.left);
    const [{ x, scale }, api] = useSpring(() => ({
      x: 0,
      scale: 1
    }))
    const bind = useDrag(({ active, movement: [x], moving, dragging }) =>{
      api.start({
        x: active ? x : Math.abs(x)>MIDLENGHT ? x > 0 ? (window.innerWidth-50) : (-window.innerWidth+50) : 0,
        scale: dragging ? 1.01 : 1,
        immediate: name => active && name === 'x',
      })
      // console.log(x);
    }
  )
  useEffect(()=>{
        setIsOnline(window.navigator.onLine);
        window.addEventListener('online', () => setIsOnline(true));
        window.addEventListener('offline', () => setIsOnline(false));
        return ()=>{
            window.removeEventListener('online', ()=>null);
            window.removeEventListener('offline', ()=>null);
        }
  },[])
  // const avSize = x.to({
  //   map: Math.abs,
  //   range: [50, 300],
  //   output: [0.5, 1],
  //   extrapolate: 'clamp',
  // })
  return (
    <Global.Capp>
      <Global.Cheader>
        <Global.Cstatus status={is_online} />
        <SettingsIcon width={30} onClick={()=>{
          _navigator("/Settings")
          // api.start({
          //   x:(-window.innerWidth+50)
          // });
        }} />
      </Global.Cheader>
      <Suspense fallback={<Global.Blocks style={{
                    margin: "3em 7em -2em auto"
                }} />}>
       <MenuContext.Provider value={{menu}}>
        {useRoutes(routes)}
      </MenuContext.Provider>
      </Suspense>
      {/* <Global.Blocks /> */}
      <Global.Cfooter {...bind()} style={{ x, scale }}>
        <Global.CMenu onClick={()=>{
          _navigator("/AddPage")
        }}><AddIcon width={50}/></Global.CMenu>
        {/* <Global.CMenu onClick={()=>{
          _navigator("/")
          }}><HomeIcon width={50}/></Global.CMenu>
        <Global.CMenu onClick={()=>{
          _navigator("/Terminal")
          }}><TerminalIcon width={50}/></Global.CMenu> */}
        <Global.CMenu onClick={()=>{
          _navigator("/Package")
        }}><PackageIcon width={50}/></Global.CMenu>
      </Global.Cfooter>
    </Global.Capp>
  )
}

export default App
