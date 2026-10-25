# PeaceD OPC Homebrew Cask (Release Candidate)
# Author: Nguyễn Hữu Dũng (MSV: 11235559)
cask "orca@rc" do
  arch arm: "arm64", intel: "x64"

  version "1.4.198"
  sha256 arm:   "fc707f290ff3b631b7b7947bf339885b61a43d2e89475997c125b61268ed4966",
         intel: "5f677c13a08f7a5740442e29d388285a86488c8c1f7aa5f10a8721a2c6ede8e4"

  url "https://github.com/dungxoan31-creator/PeaceD_OPC/releases/download/v#{version}/peaced-opc-macos-#{arch}.dmg",
      verified: "github.com/dungxoan31-creator/PeaceD_OPC/"
  name "PeaceD OPC (Release Candidate)"
  desc "AI Agent Multi-Stream Orchestration & Governance Platform by Nguyen Huu Dung"
  homepage "https://github.com/dungxoan31-creator/PeaceD_OPC"

  auto_updates true
  conflicts_with cask: "orca"
  depends_on macos: :big_sur

  app "PeaceD OPC.app"

  binary "#{appdir}/PeaceD OPC.app/Contents/Resources/bin/opc"

  zap trash: [
    "~/.peaced-opc",
    "~/Library/Application Support/PeaceD OPC",
    "~/Library/Caches/com.peaced.opc",
    "~/Library/Preferences/com.peaced.opc.plist",
  ]
end
