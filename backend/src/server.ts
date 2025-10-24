import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const port = Number(process.env.PORT || 5000);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`SRMS API listening on http://localhost:${port}`);
});
