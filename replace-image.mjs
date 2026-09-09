import fs from "fs"

let content = fs.readFileSync("src/App.tsx", "utf8")

const regex = /<svg\s+viewBox="0 0 360 290"[\s\S]*?<\/svg>/

if (regex.test(content)) {
  const imgTag =
    '<img\n            src="/hero.jpg"\n            alt="Cabin Track with RFID"\n            style={{ width: "100%", height: "100%", maxHeight: "320px", objectFit: "contain", display: "block", mixBlendMode: "multiply" }}\n          />'

  content = content.replace(regex, imgTag)
  fs.writeFileSync("src/App.tsx", content)
  console.log("Successfully replaced SVG with img tag.")
} else {
  console.log("Failed to find SVG bounds.")
}
