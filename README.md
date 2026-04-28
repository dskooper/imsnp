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
This client is designed to work flawlessly on iOS 6's Safari/WebKit, with iOS 5 support coming soon...

Any browser from then on should run PolyMSNP fine.

### Unsupported browsers
PolyMSNP was designed for legacy WebKit in mind, and therefore some browsers may not cooperate:
- Opera Mini (untested)
- Internet Explorer (untested)

Issues will be closed as "wontfix" as its out of scope (this project was never made to support anything other than mobile browsers anyway).

## Features (besides core functionality)
- Specify your own (or use predefined) MSNP11-compatible third-party servers
- Send and receive messages, nudges, and emoticons.[^1]
- Add and remove contacts from your contact list
- View and change your own username, personal message and status (online, offline/invisible, away, etc.)
- View contact's status and personal message

## Todo
- [ ] Sending images (this is gonna be a pain to implement but hopefully it'll be worth it)
- [ ] Proper versioning system **that's implemented into the program**
  - [ ] Have PolyMSNP display a build version and complain if its not the latest
- [ ] View profile pictures
- [ ] Dark mode

### List of "wontfix" features
- Winks:
  - Requires Adobe Flash which was never available on iOS[^2] and dropped from Android after Ice Cream Sandwich. <br>
- File transfers:
  - Personally out of scope, PolyMSNP is not supposed to be a feature-complete client (and also idk how to implement). <br>
    If you want to transfer files use something like [Litterbox](https://litterbox.catbox.moe)
- Voice/video calling:
  - Very out of scope considering it probably wouldn't work on mobile devices (assuming I knew how to implement that in the first place)

## Building
### Prerequisites
- The Rust programming language, downloadable from [here](https://rust-lang.org/tools/install/).
  - By association, any operating system that is still supported by Rust.

Once installed, you can do the following:
- Linux:
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
Once compiled, you can launch the server executable to immediately start hosting on 0.0.0.0 port 27677[^3].

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

[^1]: For legal reasons, PolyMSNP does not provide the ability to use the official MSN Messenger emoticons by default.
[^2]: Outside of apps such as Puffin Browser, which are no longer in development.
[^3]: Make sure that this port is not blocked by your firewall or in use by another process.
