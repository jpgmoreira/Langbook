# Langbook

A notebook application for helping in the study of languages and other subjects.

**Video tutorial:** *Coming soon.*

This program is free and open source. Feel free to fork this repo and develop your own customized version of this program, or develop new features, etc. If you develop some new cool functionality, it would be nice to let me know.

If you find any bugs, problems, problems during the installation, or have any suggestions, please contact me by opening an issue on this repository or send me an email (jpgmoreira19@gmail.com).



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

This program uses the *electron-builder* (https://www.electron.build/) library to package the application and generate installer files. If you want to, you can check their documentation and change build options inside of the *vue.config.js* file.



---

### User's guide:

Here is a description of the main features of Langbook.
You can consult this section to understand better how the application works.
For a more visual explanation, it's a good idea to watch the video tutorial on Youtube too.

#### Profiles:

- The first thing you have to do in Langbook is to create a *profile*. You can create, rename and delete profiles.
- You may create different profiles if you want, each profile has its own separate data.

#### Cards:

- In Langbook you organize your material in *cards*. Each card holds a piece of information you learned while studying. Examples: a word and its translation, a word and its pronunciation, some interesting phrase you found, a word and an image that illustrates it, etc. 
- You can create, edit, and delete cards.
- Every card has three fields: *front*, *back* and *extra*. The only required field is the *front*, the other two are optional and you may leave them blank.
- Besides its three fields, a card can also contain media information (images and audio).
- Every card must belong to at least one *session*. Sessions are explained below. Notice however that a card may be part of more than one session, and this is useful when you want to add to your current study session a card you already added to another session in the past.
- Cards can also have *tags*. Tags are better explained below. The idea is that you can use tags to easily group cards from different sessions (for example based on subject), and use them for filtering.
- When creating or editing a card, you can check or uncheck the *Allow reversed* option for the card. This is an option that will determine if during the flashcards study it will be possible to show the card with the *front* and *back* fields flipped.

#### Sessions:

- Cards belong to *sessions*. You can create, rename, delete and move sessions.
- Sessions are organized in a tree structure very similar to the way files and folders work in a computer's file system.
- Although a session may contain as many cards as you want, I highly recommend you to keep your sessions small (with few cards such as 10 to 20 cards on average). This way you can study and review less information per session.

#### Tags:

- When creating or editing a card, you can add or remove *tags* from the card. A card may contain as many tags as you want.
- A tag may contain any name you want. For example, if you are studying English you could add a *phrasal verb* tag to every card you create that contains a new phrasal verb, or you could add a *body* tag to every card that contains a new name of a body part you learned.

#### Special tags:

- Apart from the tags created by the user, Langbook has two predefined tags: the *deleted* and *audio* tags.
- Every time you delete a card, it will implicitly be marked with the *deleted* tag. You can also manually add this tag to a card to delete it.
- Undoing a card deletion can be done by removing the *deleted* tag from the card.
- Cards with the *deleted* tag will not show on filtering results nor on the flashcards study, unless you explicitly filter cards by the *deleted* tag itself (and this is how you see the cards you deleted so far).
- The *audio* tag is automatically added to all cards that have at least one audio file attached to it. This way, you can use this tag to filter only cards that have some audio, and this is useful when you want for example to study only pronunciations.
- Notice that unlike the *deleted* tag, the *audio* tag cannot be manually added nor removed from a card. This is to ensure that only cards that have an audio file have the *audio* tag. Trying to manually add or remove this tag from a card will result in an error.

#### Filtering:

- By applying filters, you can change the set of cards that are displayed to you on the screen.
- There are three types of filters: *sessions*, *tags* and *text.*
- You can select the sessions you want to filter by marking the checkboxes of these sessions on your sessions tree.
- You can use the *Tags* multiselect to filter by tags, and type some text in the *Text* input to filter by text.
- When filtering by text, the text you type must appear somewhere in the *front*, *back* or *extra* fields of the cards being filtered. 
- When the tags or text filters are empty, they are not applied during the filtering.
- When the *Filter* button gets yellow, it is indicating to you that some modification was made to the filters, and that you must click it in order to update the cards being displayed according to the new filters.
- For a card to be filtered, it must be part of **at least one** selected session.
- For a card to be filtered, it must have **all selected tags**.
- For a card to be filtered using the text filter, **at least one** of the card's fields (*front*, *back* or *extra*) must contain the text typed.
- Text filtering is case-insensitive (doesn't differentiate between uppercase and lowercase letters), and also doesn't consider blank spaces.

#### Flashcards:

- By clicking on the *Flashcards* button you open the flashcards study window.
- There, all the cards resulting from the filters you applied (the same cards displaying to you on the screen) will be shown one by one as flashcards.
- During the flashcards study, you can mark a card as *Review* or as *Suspended*.
- The *Review* and *Suspended* status of a card are not tags: they only affect the card during the current flashcards study, and will disappear as soon as you close the window.
- Under the hood, the flashcards algorithm maintains the cards marked as *Review* and not marked as *Review* into two separate queues. When a new card is to be chosen, the algorithm will choose a card from the *Review* queue with probability <i>R<sub>p</sub></i>, which is the *Review probability* you can set in the settings menu of the program. Thus, with probability <i>1 - R<sub>p</sub></i>, the next card chosen will not be some card marked as *Review*.
- The *Suspended* status works like this: Every time a *Suspended* card is chosen to be the next card, it will be only be displayed to you with probability <i>S<sub>p</sub></i>, which is the *Suspended probability* you can set in the settings menu of the program. Thus, with probability <i>1 - S<sub>p</sub></i>, the suspended card will be skipped.
- You can change the values of the *Review probability* and *Suspended probability* in the application's settings menu if you want to experiment with them and adapt it according to your desire.
- The flashcards algorithm of Langbook does not use any type of spaced repetition strategy (like Anki does). The card selection policy here consists of just shuffling the cards and showing them to you in a circular manner. This is why when you see all the cards in the flashcards study, you get back to the first card, and all cards will be shown to you in the same order again.

#### Deletions:

- Deleting a card: Consists of just adding the *deleted* tag to the card. More details in the *Special tags* session above.
- Deleting a session (or session's folder): This will just prefix the session (or folder) name with a code that identifies the point in time when the deletion occurred, and move it to the *Trash* in your session's tree. To undo a deletion, you can rename the session or folder to remove the code added to its name, and then move it out of the trash.
- Deleting a profile: When you delete a profile, it will just get marked as deleted inside your program's data. No card, media file, tag or anything will be really deleted from your machine.

#### Data storage:

- All the data of the Langbook program is stored in your machine, in a folder named *langbook-data*, which is created by the program automatically if it doesn't exist already.
- On Linux systems, this folder is placed inside your user's home directory.
- On Windows, this folder is usually placed in <...>.
- Since all information is inside this folder, **I strongly advise you to regularly make a backup of this folder** and keep it in a safe place (such as a cloud service or a separate hard drive or USB drive).
- In case you accidentally lose the data from your *langbook-data* folder in your computer, you can restore it from a copy of this folder by just placing it in the same location where the original folder was, and the program will work normally.

#### Useful commands:

- Main window: Double-clicking the area that contains the sessions' tree will toggle select/deselect all sessions and folders in the tree.

- Main window: Double-clicking a filtered card in the cards view will open the edit window for this card.

- Editor window: When editing a card, if you click an image that was dropped inside of the *front*, *back* or *extra* fields of the card, the image will get a blue outline that indicates it's now resizable. You can resize an image this way by using your mouse scroll. Notice that pressing <kbd>CTRL</kbd> while resizing increases resize precision.

- Flashcards window: You can grab and move the flashcards area with the left mouse button. You can also apply zoom to some point on the flashcards area by using your mouse scroll, and pressing the <kbd>CTRL</kbd> key while scrolling increases zoom precision. If you press the right mouse button, the original zoom and position of the flashcards area will be restored.

   

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

- *Filter* button loading icon: https://loading.io/css/

