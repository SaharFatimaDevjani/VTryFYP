import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "VTryBack API",
      version: "1.0.0",
      description: "API documentation for the VTryBack backend",
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {},
    },
  },
  // Files containing annotations as above
  apis: ["./routes/*.js", "./models/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
