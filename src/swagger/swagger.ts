import swaggerAutogen from 'swagger-autogen';

const outputFile = './src/swagger/swagger-output.json';
const endpointsFiles = ['../server.ts']; 

const doc = {
  info: {
    title: 'Food Delivery API',
    description: 'API documentation for food delivery app'
  },
  host: 'localhost:4000',
  schemes: ['http']
};

swaggerAutogen()(outputFile, endpointsFiles, doc)