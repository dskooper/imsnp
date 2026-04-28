> [!WARNING]
> This project is still in active development and currently not considered stable, please take this into consideration! <br>
> Additionally, changes are planned to be made in the next few days so keep an eye out!

<img width="192" alt="PolyMSNP logo" src="https://raw.githubusercontent.com/dskooper/PolyMSNP/refs/heads/main/logo.png" /> <br>

PolyMSNP is a lightweight web-based client for the MSNP instant messaging protocol!

This repository contains the Rust-based source code for the server.

## Servers
> [!NOTE]
> If you are hosting your own instance of PolyMSNP, please let me know!

As of right now, there is **1** website hosting this server:
- https://pmsnp.kooper.online (not 24/7, only for testing)

Even so, it is highly recommended to host PolyMSNP yourself!

## Compatibility
(**As of writing**) iMSNP's frontend is designed for iOS 6 and therefore should work flawlessly on Safari 6 and newer. <br>
In the future, there are plans to implement more frontend options.

### JavaScript/ECMAScript
Currently, the main JS script used to communicate between the device and the server is compliant with ECMAScript 5. <br>
This means support for most browses from 2009/2010 onwards (Firefox 4, Chrome/Safari 5, IE9). <br>
*An ES3 backport is planned*, anything older and it would probably be nigh impossible.

## Features
- Specify your own (or use predefined) MSNP11-compatible third-party servers
- Send and receive messages, nudges, and emoticons.[^1]
- Add and remove contacts from your contact list
- View and change your own username, personal message and status (online, offline/invisible, away, etc.)
- View contact's status and personal message

## Todo
Next build:
- [ ] Generic frontend for desktop/non-iOS mobile users with dark mode support
- [ ] Backport app.js to ECMAScript 3
  - [ ] Basic frontend for very old browsers

Next release:
- [ ] View profile pictures
- [ ] Proper versioning system **that's implemented into the program**
  - [ ] Have PolyMSNP display a build version and complain if its not the latest

***Maybe***:
- [ ] Sending images (this is gonna be a pain to implement but hopefully it'll be worth it)

### Current list of "wontfix" features
- Winks (requires Adobe Flash which is discontinued) <br>
  - Desktop users can still view Flash content via Ruffle or Clean Flash Player
- **File** transfers (not sure how to implement, also this is not meant to be a feature-complete client):
  - As a workaround you can use something like [Litterbox](https://litterbox.catbox.moe) instead.
- Voice/video calling (No clue how to implement this and also this probably wouldn't work on mobile devices)

## Building
### Prerequisites
- The Rust programming language, downloadable from [here](https://rust-lang.org/tools/install/).
  - By association, any operating system that is still supported by Rust.

Once installed, you can do the following:
- Linux and macOS:
  ```
  git clone https://github.com/dskooper/PolyMSNP
  cd polymsnp
  ./build-release.sh
  ```
- Windows:
  1. Download the entire repository by clicking on [this link](https://github.com/dskooper/PolyMSNP/archive/refs/heads/main.zip)
  2. Extract the repository into a folder and enter it.
  3. Right click on `build-release.ps1` and press on "Run with PowerShell`

If successful, there should now be a `build-rel` folder containing an executable.

## Usage
Once compiled, you can launch the server executable to immediately start hosting on 0.0.0.0 port 7659[^2].

### Adding new emoticon packs

To create a new emoticon pack for PolyMSNP, do the following:
1. Inside your PolyMSNP executable's folder, navigate to `static/emoticons`
2. Inside `packs.json`, insert a new entry:
   ```
   [
     ...,
     {
       "id": "example",
       "name": "Example Name",
       "description": "A short sentence meant to summarise the emoticons used."
     }
   ]
   ```
3. Create a new folder with the same name as the pack ID (e.g. "example")
4. Inside that folder, place all of your raw emoticon images (ideally transparent) and create a new file called `<Pack ID>.json`. Replace `<Pack ID>` with your pack's ID (e.g. "example")
5. Inside the new JSON file, create a reference to all of your emoticons:
   ```
   {
     "emoticons": {
       ":)": "happy.png",
       ":(": "sad.png",
       ">:(": "angry.png",
       ...
     }
   }
   ```

## Credits/Thanks
- [campos02](https://github.com/campos02) for creating the [MSNP11 SDK](https://github.com/campos02/msnp11-sdk) which this project uses
- [CrossTalk](https://crosstalk.im) for a great MSN Messenger revival.

## License
<img width="136" height="68" alt="gplv3-with-text-136x68" src="https://github.com/user-attachments/assets/9f55f108-02c2-46db-bf0f-84949be260ae" />

This project is open-source and provided under the GNU GPL v3 license: you can view the license contents [here](https://www.gnu.org/licenses/gpl-3.0.txt)

[^1]: For legal reasons, PolyMSNP does not use the official MSN Messenger emoticons by default. You must provide them yourself.
[^2]: Make sure that this port is not blocked by your firewall or in use by another process.
