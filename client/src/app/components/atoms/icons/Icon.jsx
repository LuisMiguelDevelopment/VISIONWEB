import Image from "next/image";
import { IoCloseOutline } from "react-icons/io5";
import { FaPhoneAlt ,FaRegCalendarAlt } from "react-icons/fa";
import { IoIosVideocam , IoMdEyeOff} from "react-icons/io";
import { HiOutlineMicrophone } from "react-icons/hi2";
import { TiCameraOutline } from "react-icons/ti";
import { CiUser } from "react-icons/ci";
import { MdOutlineMailOutline } from "react-icons/md";
import { LuEye } from "react-icons/lu";
import visionweb from "../../../../../public/VISIONWEBLOGO.png"

const Icon = ({type , onClick})=>{
    return(
        <div onClick={onClick}>
       {/* ICONS HOME */}
            {type === 'close' && <IoCloseOutline/>}
            {type === 'phone' && <FaPhoneAlt/>}
            {type === 'videoCall' && <IoIosVideocam/>}
            {type === 'microphone' && <HiOutlineMicrophone/>}
            {type === 'camera' && <TiCameraOutline/>}

        {/* ICONS HOME */}

        {/* ICONS FORMS */}

        {type === 'user' && <CiUser/> }
        {type === 'mail' && <MdOutlineMailOutline/> }
        {type === 'eye' && <LuEye/> }
        {type === 'eye-closed' && <IoMdEyeOff/> }
        {type === 'calendar' && <FaRegCalendarAlt/> }
        {type === 'visionweb' && <Image src={visionweb} width={40} height={40} alt="logo vision web"/>}

        {/* ICONS FORMS */}
        </div>
    )
}

export default Icon;