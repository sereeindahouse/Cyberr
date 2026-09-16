$root = Split-Path -Parent $PSScriptRoot
node (Join-Path $root "scripts\generate-ks-knowledge.mjs")