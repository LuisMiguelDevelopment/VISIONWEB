import Link from "next/link";
import "./Link.css";
const Linkto = ({ to, textLink }) => {
  return (
    <Link href={to} className="Link">
      {textLink}
    </Link>
  );
};
export default Linkto;
