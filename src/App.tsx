import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import GunContext from "./contexts/gun";

function App() {
  const navigate = useNavigate();

  const gun = useContext(GunContext);

  const [username, setUsername] = useState("");
  const [stake, setStake] = useState<number>();

  if (!gun) {
    throw new Error("Gun not found");
  }

  const handleButtonClick = async () => {
    if (!username) {
      alert("Please enter a username");
      return;
    }

    // if (!secretKey) {
    //   alert("Please enter a secret key");
    //   return;
    // }

    // localStorage.setItem(`${username}-sk`, secretKey);

    let keyPair = await window.crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-384",
      },
      true,
      ["sign", "verify"]
    );

    // Exporting keys
    const exportedPrivateKey = await window.crypto.subtle.exportKey(
      "jwk",
      keyPair.privateKey
    );
    const exportedPublicKey = await window.crypto.subtle.exportKey(
      "jwk",
      keyPair.publicKey
    );

    // Storing the private key in the localstorage
    localStorage.setItem(
      `${username}-privateKey`,
      JSON.stringify(exportedPrivateKey)
    );

    // Storing the public key in db
    console.log({ username, publicKey: JSON.stringify(exportedPublicKey) });
    gun
      .get("publicKeys")
      .set({ username, publicKey: JSON.stringify(exportedPublicKey) });

    // Creating the user
    gun.get("users").set({ username, stake, createdAt: Date.now() });
    console.log(
      "User created successfully and now redirecting, and public key saved"
    );
    navigate(`/${username}/0`);
  };

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-around w-full h-4/5">
        {/* Title */}
        <h1 className="pt-10 text-4xl font-bold text-center text-white">
          Welcome to the Demo of{" "}
          <div className="font-mono text-pink-700">
            Blockchain based non-repudiation
          </div>
        </h1>

        {/* Input field */}
        <div className="flex flex-col items-center w-full space-y-4">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase())}
            placeholder="Username"
            className="w-1/2 p-2 text-black"
            required
          />
          <input
            type="number"
            value={stake}
            onChange={e => setStake(parseInt(e.target.value))}
            placeholder="Stake"
            className="w-1/2 p-2 text-black"
            required
            min={0}
            max={100}
          />
          <button
            onClick={handleButtonClick}
            className="w-1/2 p-2 text-white bg-pink-700 rounded-md"
          >
            Starting Chatting!
          </button>
        </div>
      </main>
    </>
  );
}

export default App;
