import { useContext, useEffect, useState } from "react";
import GunContext from "../contexts/gun";
import Navbar from "../components/Navbar";

function UsersPage() {
  const gun = useContext(GunContext);
  if (!gun) {
    throw new Error("Gun not found");
  }

  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    gun
      .get("users")
      .map()
      .once((user, id) => {
        setUsers(users => [...users, user.username]);
      });
  }, [gun]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold text-white">Users</h1>
        <ul>
          {users.map((user, idx) => {
            return (
              <li key={idx} className="text-white">
                {user}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export default UsersPage;
