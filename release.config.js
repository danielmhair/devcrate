const fs = require("fs");

module.exports = {
  branches: ["main", { name: 'next', prerelease: true }],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", {
      changelogFile: "CHANGELOG.md"
    }],
    ["@semantic-release/npm", { npmPublish: false }],
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md", "package.json"],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],
    "@semantic-release/github"
  ]
};
