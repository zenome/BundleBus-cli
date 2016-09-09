# What is BundleBus? #
Check BundleBus github page [BundleBus](https://github.com/zenome/BundleBus) 

# BundleBus cli #
* BundleBus is a module to help the react-native application developers to easily release/deploy their application. Currently, it only supports 'github.com' but will support any other git based repository.

## Prerequisite ##
Download and run BundleBus server

## How to install ##
~~~
> npm install bundlebus-cli -g
~~~

## How to use ##

### Register ###
* 'register' command will registers your react-native app to the server.

#### Command 
* Run below command from your project root folder where 'package.json' reside.
~~~
> bundebus register
Repository clone url : {Enter your github repository}
Repository - github token : {Enter your github token}
~~~
* Guthub token can be created from this [link.](https://help.github.com/articles/creating-an-access-token-for-command-line-use/)

### Release ###
* 'release' command will pull your sources from the github and build it.

#### Command
* Run below command from your project root folder where 'package.json' reside.
~~~
> bundlebus release <os>
~~~
where os should be 'android' or 'ios'.
* the BundleBus server will pull the git sources and build it.

### Deploy ###
* Once the app is ready to be published, use 'deploy' command to simply do the job.

#### Command
* Run below command from your project root folder where 'package.json' reside.
~~~~
> bundlebus deploy <os>
~~~~

# License #
MIT
