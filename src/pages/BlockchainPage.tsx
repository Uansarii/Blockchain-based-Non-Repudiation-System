import { useContext, useEffect, useState } from "react";
import GunContext from "../contexts/gun";
import { Block } from "../utils/constants";

function BlockchainPage() {
  const gun = useContext(GunContext);
  if (!gun) {
    throw new Error("Gun not found");
  }

  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    gun
      .get("blockchain")
      .map()
      .once((block, id) => {
        setBlocks(blocks => [...blocks, block]);
      });
  }, []);

  return (
    <div>
      <h1>Blockchain</h1>

      {blocks.map((block, idx) => {
        return <pre>{JSON.stringify(block, null, 2)}</pre>;
      })}
    </div>
  );
}

export default BlockchainPage;
