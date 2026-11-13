# Official Windows evaluation image and software-emulated QEMU route

Read-only investigation on 2026-11-12. No ISO body was downloaded, registration
submitted, Microsoft account used, evaluation license accepted, or VM installed.

## Windows 11 image: real public route

The live Microsoft Evaluation Center download page exposes an English US x64
Enterprise evaluation ISO link. The link resolves without an authenticated
session to:

https://software-static.download.prss.microsoft.com/dbazure/26300.9457.260913-1737.26h2_ge_release_svc_refresh_CLIENTENTERPRISEEVAL_OEMRET_x64FRE_en-us.iso

A HEAD request returned HTTP 200, application/octet-stream, range support and
Content-Length 8225329152 bytes (about 7.66GiB). This verifies reachability and
advertised size only, not downloaded-byte authenticity or bootability.

The published evaluation prerequisites call for registration and describe a
90-day evaluation. Installation instructions state activation is needed, no
product key is required and Microsoft-account sign-in is expected. Direct link
reachability does not establish completion of registration, installation terms,
identity or activation. No user/organization identity was invented or submitted.

## Windows 10: available older image does not match target version

The live Windows 10 Evaluation Center evaluate/download URLs redirect to an
end-of-support blog. Stale search snippets are not evidence of a current 22H2
evaluation download page.

An official Microsoft Community Hub article from 2022 still exposes these links:

- Enterprise x64: https://go.microsoft.com/fwlink/p/?LinkID=2195400&clcid=0x409&country=US&culture=en-us
- LTSC x64: https://go.microsoft.com/fwlink/p/?LinkID=2195404&clcid=0x409&country=US&culture=en-us

HEAD requests both returned 200. The first resolves to build 19044.1288, Windows 10
Enterprise 21H2, size 5344178176 bytes. The second is LTSC 2021 build 19044.1288,
size 4898582528 bytes. Neither alone tests required Windows 10 22H2. An official,
verified update-to22H2 route would still be needed for the Enterprise image.
No older unofficial image or third-party mirror was used.

The former official prebuilt development-VM download URL now redirects to
general Windows developer documentation rather than a ready-made appliance.

## Local feasibility, without claiming execution

The current host is Debian 13 x64 with about 9.7GiB RAM and 55GiB free workspace
space. QEMU, OVMF and swtpm are not installed on PATH; /dev/kvm is absent.

QEMU's official documentation supports TCG software CPU emulation on Linux,
including x86. KVM is therefore not required in principle. QEMU user-mode
networking and an external swtpm 2 emulator can operate without root. A compliant
Windows 11 guest still needs suitable UEFI/SecureBoot firmware, TPM 2, at least 4 GB
guest memory, two virtual CPUs, and at least 64 GB virtual disk space.

A sparse 64 GiB qcow2 virtual disk can occupy less physical storage than its
advertised capacity. Therefore 55 GiB free does not make a single guest impossible.
Keeping the 7.66 GiB ISO, guest sectors, tools and test outputs within that budget
needs disk-growth monitoring; capacity or installation speed has not been tested.
No install-time hardware-requirement bypass is proposed. Tools would first need
to be provisioned into a writable user directory with their dependencies.

TCG would supply an x64 Windows client OS under software CPU emulation. Such a
result would narrow the client-OS gap but is not a physical native Intel/AMD
device, physical audio/display, or clean owner-PC acceptance result.

## Concrete remaining input and next executable stage

The image route is technically reachable, not blocked by an HTTP sign-in wall.
Before installation, evaluation registration/terms/identity/activation handling
must be legitimately resolved; this investigation was expressly limited to
read-only research. Next technical stage would provision QEMU+firmware+swtpm,
verify the official ISO hash, boot a correctly configured isolated guest and
measure whether software emulation is practical. No pass is claimed in advance.

## Primary sources

- https://www.microsoft.com/en-us/evalcenter/download-windows-11-enterprise
- https://learn.microsoft.com/en-us/windows/whats-new/windows-11-requirements
- https://techcommunity.microsoft.com/discussions/windows10space/accessing-trials-and-kits-for-windows-10/3361184/
- https://www.microsoft.com/en-us/evalcenter/download-windows-10-enterprise/
- https://developer.microsoft.com/en-us/windows/downloads/virtual-machines/
- https://www.qemu.org/docs/master/system/introduction.html
- https://www.qemu.org/docs/master/system/images.html
- https://qemu-project.gitlab.io/qemu/specs/tpm.html
