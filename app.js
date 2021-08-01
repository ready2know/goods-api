const app = require("./config/express");
const db = require("./config/db");

db.connect()
  .then((result) => {
    const listener = app.listen(process.env.PORT || 3001, () => {
      console.log(`Server listen on ${listener.address().port}`);
    });
  })
  .catch((err) => console.log(err));
