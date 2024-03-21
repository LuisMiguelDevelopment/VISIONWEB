import './title.css';
import Icon from '../icons/Icon';
const Title = ({level , text }) =>{

    return(
        <>
            {level === 'h1' && <h1 className='h1'>{text}</h1> }
            {level === 'h2' && <h2 className='h2'>{text}</h2> }
            {level === 'h3' && <h3 className='h3'>{text}</h3> }
        </>
    )
}

export default Title;