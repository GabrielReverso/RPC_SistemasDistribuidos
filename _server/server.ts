import * as grpc from "@grpc/grpc-js";
import { CalculateJackpotRequest, CalculateJackpotResponse, EmptyRequest, RandomPlayResponse, SlotMachineServer, SlotMachineService } from "../_service/slotMachine";

// Implementação do servidor
const slotMachineServer: SlotMachineServer = {
	randomPlay: (call, callback) => {
		const request: EmptyRequest = call.request;

		const ip = call.getPeer();
		const timestamp = new Date().toISOString();

		console.log(
			`\n\x1b[32m[${timestamp}]\x1b[0m Requisição RandomPlay recebida de \x1b[36m${ip}\x1b[0m`
		);
		console.log(`Dados recebidos:`, request);

		const response: RandomPlayResponse = { slot0: "a", slot1: "a", slot2: "a" };
		callback(null, response);
	},
	calculateJackpot: (call, callback) => {
		const request: CalculateJackpotRequest = call.request;

		const ip = call.getPeer();
		const timestamp = new Date().toISOString();

		console.log(
			`\n\x1b[32m[${timestamp}]\x1b[0m Requisição calculateJackpot recebida de \x1b[36m${ip}\x1b[0m`
		);
		console.log(`Dados recebidos:`, request);

		const response: CalculateJackpotResponse = { result: 10 }
		callback(null, response);
	}
};

const server = new grpc.Server();
server.addService(SlotMachineService, slotMachineServer);

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
