import { Link } from "react-router-dom";

type Props = {
  username?: string;
};

function Navbar({ username }: Props) {
  return (
    <div className="flex items-center justify-between py-5 font-semibold text-white border-b-2">
      <div className="text-2xl">Chat App</div>

      <div className="flex space-x-10">
        {username && <div className="text-xl">{username}</div>}
        <Link to="/">Home</Link>
        <Link to="/users">Users</Link>
        <Link to="/blockchain">Blockchain</Link>
      </div>
    </div>
  );
}

export default Navbar;
