# Windows x64 client evaluation testing

VisionForge does not introduce a paid application activation key. Buying a Windows
key is not a prerequisite for this testing route: the workflows use Microsoft's
official time-limited Enterprise evaluation media and its normal installation
terms. They create isolated test accounts, not Microsoft accounts or identities.
No product key, activation workaround, TPM bypass or owner-PC installation is used.

The existing installed Windows Server and Windows 11 ARM/x64-emulation workflows
remain evidence for their recorded revisions. The new workflows add actual x64
client-OS guests, using KVM where available or explicitly recorded QEMU TCG
otherwise. Virtual-machine coverage does not establish physical device, speaker,
display-driver, accessibility or clean owner-PC acceptance.

## Workflows and acceptance

- `windows-client-evaluation.yml`: hash-verified Windows 11 Enterprise x64 media.
- `windows10-client-evaluation.yml`: hash-verified Windows 10 Enterprise 21H2
  evaluation media followed by Microsoft's KB5015878 prerequisite and KB5015684
  22H2 enablement package. WUSA performs normal package applicability/catalog
  validation. Build 19045 is required before app acceptance runs.
- The installed app is the already tested internal candidate from run
  `43196669781`, installer SHA256
  `cbf3eecda878bfa68a425fdb7d637ff6d2248ba337cd06e848a7aaf50fdb87f7`.
- The guest records OS/CPU architecture, Secure Boot, TPM2 and evaluation status.
  It runs the editor/preview/export/recovery, security, keyboard and stock-video
  fixture workflows, validates bundled notices, and checks uninstallation.
- Only a guest completion record with `passed: true` and successful workflow is
  acceptance evidence. Downloading, booting, running or taking a screenshot alone
  is not a pass. Live Pexels credentials/CDN access are not established by fixtures.

Early checkpoint artifacts retain installation screenshots, host acceleration and
diagnostic logs. Final artifacts retain guest reports. They exclude Windows ISO
files, guest disks, answer files, generated passwords and setup tokens. Those stay
in the temporary isolated runner and are not owner installation deliverables.

## Primary references

- https://www.microsoft.com/en-us/evalcenter/evaluate-windows-11-enterprise
- https://support.microsoft.com/en-us/servicing/os/windows/docs/2026/09/verify-the-authenticity-of-a-windows-11-enterprise-evaluation-iso-file
- https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/automate-windows-setup
- https://learn.microsoft.com/en-us/windows-hardware/customize/desktop/unattend/microsoft-windows-shell-setup-useraccounts-localaccounts-localaccount
- https://support.microsoft.com/en-us/servicing/os/windows-10/2022/06/kb5015684-featured-update-to-windows-10-version-22h2-by-using-an-enablement-package
