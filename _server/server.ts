import * as grpc from "@grpc/grpc-js";
import { CalculatorService, CalculatorServer } from "../_service/calculator";
import { AddRequest, AddResponse } from "../_service/calculator";

// Implementação do servidor
const calculatorServer: CalculatorServer = {
	add: (call, callback) => {
		const request: AddRequest = call.request;
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
		console.log(`🚀 Servidor gRPC rodando na porta ${port}`);
	}
);
