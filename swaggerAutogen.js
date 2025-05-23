"use strict"

const HOST = "https://task-manager-api-virid.vercel.app"

const swaggerAutogen = require('swagger-autogen')()
const packageJson = require('./package.json')

const document = {
	info: {
		version: packageJson.version,
		title: packageJson.title,
		description: packageJson.description,
		termsOfService: "https://furkandogu.vercel.app",
		contact: { name: packageJson.author, email: "furkandogu2018@gmail.com" },
		license: { name: packageJson.license, },
	},
	host: `${HOST}`,
	basePath: '/',
	schemes: ['https'],
	consumes: ["application/json"],
	produces: ["application/json"],
	securityDefinitions: {
		bearerAuth: {
			type: "http",
			scheme: "bearer",
			bearerFormat: "JWT",
			description: "JWT Authorization header using the Bearer scheme. Example: <b>Bearer yourTokenHere</b>"
		}
	},
	security: [{ bearerAuth: [] }]
};

const routes = ['./index.js']
const outputFile = './src/configs/swagger.json'

swaggerAutogen(outputFile, routes, document)