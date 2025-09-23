import express from "express";
import * as grpc from "@grpc/grpc-js";
import { CalculatorClient } from "../_service/calculator";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*"); // permite qualquer origem
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET,POST,PUT,DELETE,OPTIONS"
	); // métodos permitidos
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization"
	); // headers permitidos
	if (req.method === "OPTIONS") return res.sendStatus(204); // preflight
	next();
});

app.post("/add", (req, res) => {
	const { a, b } = req.body;

	const client = new CalculatorClient(
		"localhost:50051",
		grpc.credentials.createInsecure()
	);

	client.add({ a, b }, (err, response) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(response);
	});
});

app.listen(3000, () => {
	console.log(
		`\n🚀 Servidor \x1b[1;36mHTTP/gRPC\x1b[0m rodando na porta \x1b[1;32m3000\x1b[0m\n`
	);
});
