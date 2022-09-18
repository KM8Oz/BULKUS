import { FC, useEffect } from 'react'
import { Link, useNavigate  } from "react-router-dom"
import Global from "../styledcomponent"
import { loadall } from '../tools';

const index: FC = () => {
  let _navigator = useNavigate();
  useEffect(()=>{
    loadall().then(()=>{
      _navigator("/AddPage");
    })
  }, [])
  return (
    <Global.Blocks style={{
      margin: "3em 7em -2em auto"
  }} />
  )
}

export default index