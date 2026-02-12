#!/bin/bash

# A universal script to detect deprecated dependencies in any npm project
# Works for: React, Angular, Vite, Next.js, Node.js, Vue, Svelte, Astro

echo "🔍 Scanning package.json for deprecated packages..."
echo "---------------------------------------------------"

# Extract dependencies and devDependencies
packages=$(jq -r '.dependencies // {} | to_entries[] | "\(.key)@\(.value)"' package.json)
packages_dev=$(jq -r '.devDependencies // {} | to_entries[] | "\(.key)@\(.value)"' package.json)

all_packages=$(printf "%s\n%s" "$packages" "$packages_dev")

printf "%-35s %-20s %-10s\n" "PACKAGE" "VERSION" "DEPRECATED?"
echo "---------------------------------------------------------------------"

for pkg in $all_packages; do
  name=$(echo $pkg | cut -d '@' -f 1)
  version=$(echo $pkg | cut -d '@' -f 2-)

  deprecated=$(npm view "$name@$version" deprecated 2>/dev/null)

  if [[ -n "$deprecated" && "$deprecated" != "null" ]]; then
    status="YES ❌"
  else
    status="NO ✔️"
  fi

  printf "%-35s %-20s %-10s\n" "$name" "$version" "$status"
done

echo "---------------------------------------------------"
echo "✨ Scan complete!"