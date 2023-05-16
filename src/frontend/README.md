# Run project locally

- clone the repo
- cd src/frontend
- run command

```
yarn install
```

Macos

```
yarn start
```

Linux

```
yarn start:evenlop
```

Windows

- not supported (you can create seperate command like `start:win`)

# Husky hooks & GTM (git time metric)

Our project is using git hooks. To be able commit your changes you need to install gtm on your machine.

## Steps to install gtm

### Macos

```
brew tap git-time-metric/gtm
brew install gtm
```

### Linux

You need to install homebrew befor installing gtm
Here is the link https://docs.brew.sh/Homebrew-on-Linux.

> NOTE: maybe you need to add brew yo your home PATH, because it can dissapear from your commands. Open .bashrc file located at home directore and add this script on at the last line

```
# brew
export PATH="/home/linuxbrew/.linuxbrew/bin:$PATH"
```

> DO NOT OVERRRIDE CONTENT OF .bashrc file!!!

After brew is installed, tun the following commands

```
brew tap git-time-metric/gtm
brew install gtm
```

### Windows

Download gtm exe file from official repo (https://github.com/git-time-metric/gtm/releases/tag/v1.3.5) and run it.

Now you have installed gtm, so go to the root folder of your project (not `src/frontend`, but the actual root `./`) and run command:

```
gtm init
```

Congrats, you initialized gtm, now you can commit messages.

To commit a message you need to do it in this way:

```
git commit -m "MAV-123/message"
```

Where 123 - is task number on which you are working on.
