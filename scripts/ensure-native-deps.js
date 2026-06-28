/**
 * Work around npm optional-dependency installs on Windows (common with OneDrive paths).
 * Vercel/Linux installs the correct platform packages automatically.
 */
const { execSync } = require("node:child_process");
const { platform, arch } = require("node:os");

if (platform() !== "win32" || arch() !== "x64") {
  process.exit(0);
}

const packages = [
  "lightningcss-win32-x64-msvc",
  "@tailwindcss/oxide-win32-x64-msvc",
];

for (const pkg of packages) {
  try {
    require.resolve(pkg);
  } catch {
    execSync(`npm install ${pkg} --no-save --no-fund --no-audit`, {
      stdio: "inherit",
    });
  }
}
