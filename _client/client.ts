import express, { Request, Response } from "express";
import * as grpc from "@grpc/grpc-js";
import {
	CalculateJackpotResponse,
	SlotMachineClient,
} from "../_service/slotMachine";
import { ApiResponse } from "../api-response";

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

app.post(
	"/spin",
	(
		req: Request<{}, {}, { bet: number }>,
		res: Response<ApiResponse<CalculateJackpotResponse>>
	) => {
		try {
			const client = new SlotMachineClient(
				"localhost:50051",
				grpc.credentials.createInsecure()
			);

			client.randomPlay({}, (err, spinResult) => {
				if (err)
					return res.json({ success: false, error: err.message });
				client.calculateJackpot(
					{ ...spinResult, bet: req.body.bet },
					(err, response) => {
						if (err)
							return res.json({
								success: false,
								error: err.message,
							});
						res.json({ success: true, data: response });
					}
				);
			});
		} catch (error) {
			return res.json({ success: false, error: error.message });
		}
	}
);

app.listen(3000, () => {
	console.log(
		`\n🚀 Servidor \x1b[1;36mHTTP/gRPC\x1b[0m rodando na porta \x1b[1;32m3000\x1b[0m\n`
	);
});
