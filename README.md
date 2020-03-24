

# Run without Redis
```
npm start
```

# Run with local Redis
```
# run redis in a different terminal
docker run --rm -p 6379:6379 redis

# in a different terminal
USE_REDIS=true npm start 
```

# Dockerise it
```
# build container
docker build -t webapp .


# run redis in detached mode
docker run --rm -p 6379:6379 redis

# run our app container
docker run --rm -it -p 80:80 --env USE_REDIS=true --env REDIS_HOST=host.docker.internal webapp

curl localhost

# kill everything
docker kill $(docker ps -q)

```

# Docker Compose
can use a .env file to specify env
```
docker-compose up
curl localhost
```

# Deploying to AWS
see https://github.com/whathelll/cdk-test.git