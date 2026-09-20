# broken-app

Four containers that refuse to work, for the debugging lab. Each one fails in a
way you will meet in real life. Do not read `ANSWERS.md` until you have used
`docker logs`, `docker inspect` and `docker run -it --entrypoint sh`.

Build and run each in turn:

```sh
docker build -f Dockerfile.1 -t broken:1 . && docker run --rm -p 3000:3000 broken:1
docker build -f Dockerfile.2 -t broken:2 . && docker run --rm -p 3000:3000 broken:2
docker build -f Dockerfile.3 -t broken:3 . && docker run --rm -p 3000:3000 broken:3
docker build -f Dockerfile.4 -t broken:4 . && docker run --rm -p 3000:3000 broken:4
```

For each one, write down: what `docker ps -a` shows, what the exit code is,
what the logs say, and the one line you changed to fix it.
