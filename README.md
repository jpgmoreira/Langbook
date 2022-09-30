# Langbook

A notebook application for helping on the study of languages and other subjects.

**Video tutorial:** *Coming soon.*

This program is *Free and Open Source Software*. Feel free to fork this repo and develop your own customized version of this program, or develop new features, etc. If you develop some new cool functionality, it would be nice to let me know.

If you find any bugs, problems, problems during the installation, or have any suggestions, please contact me by opening an issue in this repository or sending me an email (jpgmoreira19@gmail.com).



---

### Installation:

Currently there are pre-built installers for Windows and Linux systems.
Just download the appropriate file for your system and install it.
The most recent version of this program is **1.0.0**, released on **September 30, 2022**.

- Windows: [Download here](https://github.com/jpgmoreira/langbook/releases/download/v1.0.0/Langbook.Setup.1.0.0.exe).
- Linux *.deb* file (for Ubuntu, Mint, and other Debian-based distros): [Download here](https://github.com/jpgmoreira/langbook/releases/download/v1.0.0/langbook_1.0.0_amd64.deb).

- Linux *.rpm* file (if your distro uses rpm, like Fedora or CentOS): [Download here](https://github.com/jpgmoreira/langbook/releases/download/v1.0.0/langbook-1.0.0.x86_64.rpm).

  

---

### Building from source:

You can also build the program from source code if you want to.

This program was made using Node.js and the Electron framework. If you don't have Node.js and npm installed on your system, the first thing to do is to install them. On Windows you can download Node from the official website: https://nodejs.org/ . If you are on Linux, a convenient way to install Node is to follow the steps described in this Stackoverflow answer: https://stackoverflow.com/a/32740546/7974053 .

After you have Node.js and npm set up on your system, follow the steps below:

1. Clone or download this repository's code to your local machine.
2. Open a terminal and `cd` to the repository's folder.
3. Run `npm install`. It will install all dependencies for the application. Note that in Linux sometimes you have to run this as `sudo npm install`.
4. After the command above finishes, run `npm run electron:build`. This will create a folder named *dist_electron* and put inside of it, among other things, a installer file which you can use to install the application on your machine.

This program uses the *electron-builder* (https://www.electron.build/) library to package the application and generate executable files. If you want to, you can check their documentation and change build options inside of the *vue.config.js* file.



---

### User's guide:

Coming soon.



---

### Icons' credits:

Icons are placed inside the *build/icons* folder and also in *src/frontend/assets/images*.

- build/icons: <a href="https://www.flaticon.com/free-icons/languages" title="languages icons">Languages icons created by Smashicons - Flaticon</a>

- audio.png: <a href="https://www.flaticon.com/free-icons/speaker" title="speaker icons">Speaker icons created by Freepik - Flaticon</a>

- book.png: <a href="https://www.flaticon.com/free-icons/book" title="book icons">Book icons created by Freepik - Flaticon</a>

- caret-dark.png: <a href="https://www.flaticon.com/free-icons/up-arrow" title="up arrow icons">Up arrow icons created by Creatype - Flaticon</a>

- caret.png: <a href="https://www.flaticon.com/free-icons/up-arrow" title="up arrow icons">Up arrow icons created by Creatype - Flaticon</a>

- folder.png: <a href="https://www.flaticon.com/free-icons/folder" title="folder icons">Folder icons created by Freepik - Flaticon</a>

- info.png: <a href="https://www.flaticon.com/free-icons/info" title="info icons">Info icons created by Roundicons - Flaticon</a>

- logout.png: <a href="https://www.flaticon.com/free-icons/logout" title="logout icons">Logout icons created by Pixel perfect - Flaticon</a>

- picture.png: <a href="https://www.flaticon.com/free-icons/photo" title="photo icons">Photo icons created by Gregor Cresnar - Flaticon</a>

- tooltip-dark.png: <a href="https://www.flaticon.com/free-icons/info" title="info icons">Info icons created by Freepik - Flaticon</a>

- tooltip.png: <a href="https://www.flaticon.com/free-icons/info" title="info icons">Info icons created by Freepik - Flaticon</a>

- trash.png: <a href="https://www.flaticon.com/free-icons/recycle-bin" title="recycle bin icons">Recycle bin icons created by Aranagraphics - Flaticon</a>

- toolbar/backgroundcolor.png: <a href="https://www.flaticon.com/free-icons/marker" title="marker icons">Marker icons created by Creaticca Creative Agency - Flaticon</a>

- toolbar/bold.png: <a href="https://www.flaticon.com/free-icons/bold" title="bold icons">Bold icons created by Freepik - Flaticon</a>

- toolbar/italic.png: <a href="https://www.flaticon.com/free-icons/italic" title="italic icons">Italic icons created by Freepik - Flaticon</a>

- toolbar/redo.png: <a href="https://www.flaticon.com/free-icons/undo" title="undo icons">Undo icons created by Pixel perfect - Flaticon</a>

- toolbar/undo.png: <a href="https://www.flaticon.com/free-icons/undo" title="undo icons">Undo icons created by Pixel perfect - Flaticon</a>

- toolbar/strikethrough.png: <a href="https://www.flaticon.com/free-icons/strikethrough" title="strikethrough icons">Strikethrough icons created by Freepik - Flaticon</a>

- toolbar/subscript.png: <a href="https://www.flaticon.com/free-icons/subscript" title="subscript icons">Subscript icons created by Freepik - Flaticon</a>

- toolbar/superscript.png: <a href="https://www.flaticon.com/free-icons/superscript" title="superscript icons">Superscript icons created by Freepik - Flaticon</a>

- toolbar/textcolor.png: <a href="https://www.flaticon.com/free-icons/font" title="font icons">Font icons created by Freepik - Flaticon</a>

- toolbar/underline.png: <a href="https://www.flaticon.com/free-icons/underline" title="underline icons">Underline icons created by Freepik - Flaticon</a>

  
