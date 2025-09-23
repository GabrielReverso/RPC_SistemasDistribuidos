import * as grpc from "@grpc/grpc-js";
import { CalculatorService, CalculatorServer } from "../_service/calculator";
import { AddRequest, AddResponse } from "../_service/calculator";

// Implementação do servidor
const calculatorServer: CalculatorServer = {
	add: (call, callback) => {
		const request: AddRequest = call.request;

		const ip = call.getPeer();
		const timestamp = new Date().toISOString();

		console.log(
			`\n\x1b[32m[${timestamp}]\x1b[0m Requisição Add recebida de \x1b[36m${ip}\x1b[0m`
		);
		console.log(`Dados recebidos:`, request);

		const response: AddResponse = { result: request.a + request.b };
		callback(null, response);
	},
};

const server = new grpc.Server();
server.addService(CalculatorService, calculatorServer);

server.bindAsync(
	"0.0.0.0:50051",
	grpc.ServerCredentials.createInsecure(),
	(err, port) => {
		if (err) throw err;
		console.log(
			`🚀 Servidor \x1b[1;36mgRPC\x1b[0m rodando na porta \x1b[1;32m${port}\x1b[0m`
		);
	}
);
