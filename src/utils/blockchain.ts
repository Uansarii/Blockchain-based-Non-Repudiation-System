import { IGunInstance } from "gun";
import { Block, Message } from "./constants";
import { Base64 } from "js-base64";

const crypto = window.crypto.subtle;
const HASH_ALGORITHM = "SHA-384";
const DIFFICULTY = 2; // 2 Bytes of zeroes

export function writeSendMessageRequestOnBlockChain(
  data: Message,
  privateKey: CryptoKey,
  gun: IGunInstance
) {
  const messageToSign = `${data.message} says ${data.message} at ${data.timestamp}`;
  const encodedMessage = new TextEncoder().encode(messageToSign);

  const signature = decodeObject(
    crypto.sign(
      {
        name: "ECDSA",
        hash: {
          name: HASH_ALGORITHM,
        },
      },
      privateKey,
      encodedMessage
    )
  );
}

export async function signMessage(message: string, privateKey: CryptoKey) {
  const encodedMessage = new TextEncoder().encode(message);

  const signedArr = await crypto.sign(
    {
      name: "ECDSA",
      hash: {
        name: HASH_ALGORITHM,
      },
    },
    privateKey,
    encodedMessage
  );

  // Convert this to a string
  return Array.from(new Uint8Array(signedArr))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyBroadcastedMessage(
  username: string,
  data: string,
  signature: string,
  gun: IGunInstance,
  cb: (success: boolean) => void
) {
  gun
    .get("publicKeys")
    .map()
    .once(async row => {
      if (row && row.username === username) {
        const publicKey = await crypto.importKey(
          "jwk",
          JSON.parse(row.publicKey),
          {
            name: "ECDSA",
            namedCurve: "P-384",
          },
          true,
          ["verify"]
        );

        const sigBuf = new Uint8Array(
          (signature.match(/.{1,2}/g) as any).map(byte => parseInt(byte, 16))
        );
        crypto
          .verify(
            {
              name: "ECDSA",
              hash: {
                name: HASH_ALGORITHM,
              },
            },
            publicKey,
            sigBuf,
            new TextEncoder().encode(data)
          )
          .then(res => {
            console.log({ res });
            cb(res);
          });
      }
    });
}

async function checkForGenesisBlock(gun: IGunInstance) {
  let isBlockchainEmpty = true;
  gun
    .get("blockchain")
    .map()
    .once((data, key) => {
      console.log("data");
      isBlockchainEmpty = false;
    });

  if (isBlockchainEmpty) {
    const ts = Date.now();
    const nonce = 0;
    const signature = "";
    const previousHash = "";

    const data = {
      data: "Genesis Block",
      timestamp: ts,
      nonce,
      signature,
      previousHash,
    };

    const encodedData = encodeObject(data);
    const hashArray = await crypto.digest(HASH_ALGORITHM, encodedData);
    const hash = decodeObject(hashArray);

    const block: Block = {
      data: "Genesis Block",
      timestamp: ts,
      nonce,
      signature,
      hash,
      prevHash: previousHash,
    };

    gun.get("blockchain").get("genesis").put(block);
  }
}

function encodeObject(data: any) {
  return new TextEncoder().encode(JSON.stringify(data));
}

function decodeObject(data: any) {
  return new TextDecoder().decode(data);
}

async function generateHashWithDifficulty(
  data: string,
  difficulty: number = DIFFICULTY
) {
  let nonce = 0;
  let hash = "";
  while (1) {
    const encodedData = encodeObject(data + nonce);
    const hashArray = await crypto.digest(HASH_ALGORITHM, encodedData);
    hash = decodeObject(hashArray);

    if (hash.slice(0, difficulty) === "0".repeat(difficulty)) {
      break;
    }
    nonce++;
  }
  return { hash, nonce };
}

function sendString(data: Message) {
  return `${data.from} says ${data.message} at ${data.timestamp}`;
}

function ackString(data: Message, username: string) {
  return `${username} has acknowledged '${data.from} says ${data.message} at ${data.timestamp}`;
}

export async function broadcastSendMessage(
  data: Message,
  privateKey: CryptoKey,
  gun: IGunInstance
) {
  const message = sendString(data);
  const signature = await signMessage(message, privateKey);

  const dataToBeWritten = {
    username: data.from,
    message,
    signature,
  };

  gun.get("broadcast").put(dataToBeWritten);

  return dataToBeWritten;
}

export async function broadcastAckMessage(
  data: Message,
  username: string,
  privateKey: CryptoKey,
  gun: IGunInstance
) {
  const message = ackString(data, username);
  const signature = await signMessage(message, privateKey);

  gun.get("broadcast").put({
    username,
    message,
    signature,
  });
}
