## Development

```bash
cp .env.sample .env
docker-compose up --build -d
```

## Publish

```bash
docker build -t jaeseoparkdocker/mlib-ui:latest .
docker push
```
