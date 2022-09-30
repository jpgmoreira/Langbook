# Langbook

A notebook application for helping on the study of languages and other subjects.

**Video tutorial:** *Coming soon.*

---

### Installation:

Currently there are pre-built installers for Windows and Linux systems.
Just download the appropriate file for your system and install it.

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





---

### Icons credits:



















