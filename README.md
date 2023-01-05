# fake-failbot

Now you can put

```sh
HAYSTACK_URL=http://username:password@localhost:5555/api/needles
```

in your `.env` and FailBot will be enabled locally, but writes
the the `db.json` file.

Start it with:

```sh
npm install
npm run start
```
