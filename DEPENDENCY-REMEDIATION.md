# Build dependency remediation

The six recorded moderate npm advisories traced to minimatch 9.0.9 and 10.2.6 in Electron packaging dependencies. Exact-version overrides replace those two versions with 11.0.1. Older minimatch 3/5 APIs used by other dependencies are retained; they are outside this advisory's affected range. The Electron builder itself remains pinned to 26.18.0.

Reference: https://github.com/advisories/GHSA-g3hv-75wg-m249; upstream implementation/docs: https://github.com/isaacs/minimatch.

Local npm audit reports zero advisories (evidence/dependency-remediation-audit.json). TypeScript, build, all 42 Linux tests and 12 actual Electron desktop checks pass (evidence/dependency-remediation-verification.txt). This is a known-advisory check, not proof of complete security. A new hosted Windows packaging/install/run/uninstall verification is pending; the previous accepted Windows test commit predates these overrides.

Dependency inventory is regenerated from installed package roots named in package-lock.json, excluding anonymous nested ESM/CJS metadata that the former inventory incorrectly counted as packages. It covers installed packages on the current host; platform-specific optional packages may differ on Windows.
