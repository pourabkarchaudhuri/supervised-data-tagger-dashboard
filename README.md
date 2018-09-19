# Data Tag Dashboard for Supervised Learning
##### A Visial representation for data scientists and developers to use unlabelled clustered data to tag and convert to labelled data to train classifiers

## Inspiration
This project is greatly inspired from the Azure Video Indexer and AWS Rekognition console, with a drag and drop enabled workspace to manage bulk of images which is impossible for a person to manually go through.

### Technology

Oversight uses a number of open source projects to work properly:

* [Twitter Bootstrap] - great UI boilerplate for modern web apps
* [node.js] - evented I/O for the backend
* [Express] - fast node.js network app framework
* [Gulp] - the streaming build system
* [jQuery] - duh


### Architecture Diagram

##### Architecture for Clustering Pipeline

### Installation

This dashboard requires nodejsv8.11+ to run.

Install the dependencies and devDependencies and start the server.

### For Local on Windows/MacOS/Linux:
```sh

$ npm install
$ node index.js
```

### For EC2 on AWS:
For EC2 Configuration, Use AMI : Amazon Linux II :

```sh
$ sudo yum update
$ sudo yum install git
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
$ . ~/.nvm/nvm.sh
$ nvm install 8.11.0

```
For Dashboard Application Startup, clone this repo and follow the steps below :

```sh

$ npm install
$ cd dist/
$ forever start -a -o ./out.log -e ./err.log --uid 'Dashboard' app.js
```
To Kill Application Startup or if PORT 5000 in USE, follow the steps below :

```sh
$ forever stop Dashboard
```

### Todos

 - Optimize Further to increase speed
 - Implement Docker and Jenkins based deployment

License
----

Public


   [Node.JS]: <https://nodejs.org/en/>
   [Python]: <https://www.python.org/>
[node.js]: <http://nodejs.org>
   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [jQuery]: <http://jquery.com>
   [express]: <http://expressjs.com>
   [Gulp]: <http://gulpjs.com>

  
