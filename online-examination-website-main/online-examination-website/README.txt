ONLINE EXAMINATION WEBSITE
==========================

FEATURES
--------
1. Student login using name and roll number.
2. Five multiple-choice questions.
3. Five-minute countdown timer.
4. Automatic submission when the timer reaches zero.
5. Java server calculates the score and sends the result to the browser.

REQUIREMENTS
------------
- Java JDK 11 or later
- A modern web browser

PROJECT STRUCTURE
-----------------
online-examination-website/
    web/
        index.html
        style.css
        app.js
    src/
        ExamServer.java
    README.txt

HOW TO RUN (WINDOWS)
--------------------
1. Extract the ZIP file.
2. Open the extracted online-examination-website folder in VS Code or File Explorer.
3. Open a terminal in that folder.
4. Compile the Java program:

       javac -d out src/ExamServer.java

5. Start the Java server:

       java -cp out ExamServer

6. Open this address in your browser:

       http://localhost:8080

7. Enter a student name and roll number, answer the questions, and submit.
   The timer is five minutes. You may also submit before time ends.

IMPORTANT
---------
- Keep the terminal/server running while using the website.
- Do not open index.html directly. Open http://localhost:8080 instead.
- The Java program calculates the score on the server side.
- This is a simple classroom demonstration. The login is not connected to a
  database and does not verify real student accounts.
- To change the questions, update the questions array in web/app.js and update
  the matching ANSWERS array in src/ExamServer.java.
