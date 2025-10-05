import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger/swagger-output.json'
import { cartRouter } from './Controller/cart.controller.js';


const app = express();
const port = 4000;
app.use(express.json());


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/v1/cart', cartRouter);

app.listen(port, () => {
  console.log(`Server running: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api-docs`);
});
