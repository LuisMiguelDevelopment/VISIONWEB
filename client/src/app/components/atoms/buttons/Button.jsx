import './button.css';
import classnames from "classnames";

const Button = ({variant , text }) => {

    const buttonClasses = classnames("button",{
        buttonBlue: variant === 'buttonBlue',
        buttonRed: variant === 'buttonRed',
        buttonGrey: variant === 'buttonGrey',
        buttonGreen: variant === 'buttonGreen'
    })

  return (
    <button className={buttonClasses} >
        {text}
    </button>
  )
}

export default Button