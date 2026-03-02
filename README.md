# WebMSNP
WebMSNP is a web-based client for the MSNP instant messaging protocol targeting at least iOS 6 WebKit!

This repository contains the Rust-based source code for the server.

## Thanks
- [campos02](https://github.com/campos02) for creating the [MSNP11 SDK](https://github.com/campos02/msnp11-sdk) which this project uses

## Servers
As of right now, there is **1** website hosting this server:
- https://webmsnp.kooper.online
  - Hosted from my own machine; not 24/7 at the moment

## Building
### Prerequisites
- The Rust programming language, download from [here](https://rust-lang.org/tools/install/).

Once done, you can do the following:
- Linux:
  ```
  git clone https://github.com/dskooper/webmsnp
  cd webmsnp
  ./build-release.sh
  ```
- Windows:
  1. Download the entire repository by clicking on [this link](https://github.com/dskooper/webmsnp/archive/refs/heads/main.zip)
  2. Extract the repository into a folder and enter it.
  3. Right click on `build-release.ps1` and press on "Run with PowerShell`


If successful, there should now be a `build-rel` folder containing an executable.

## Usage
Once compiled, you can launch the server executable to immediately start hosting on 0.0.0.0 port 27677.

Make sure that port 27677 is not being blocked by your firewall or being used by another process.

## License
<img width="136" height="68" alt="gplv3-with-text-136x68" src="https://github.com/user-attachments/assets/9f55f108-02c2-46db-bf0f-84949be260ae" />

This project is open-source and provided under the GNU GPL v3 license: you can view the license contents [here](https://www.gnu.org/licenses/gpl-3.0.txt)
