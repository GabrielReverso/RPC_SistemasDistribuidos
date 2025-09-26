import * as grpc from "@grpc/grpc-js";
import {
	CalculateJackpotRequest,
	CalculateJackpotResponse,
	RandomPlayResponse,
	SlotMachineServer,
	SlotMachineService,
} from "../_service/slotMachine";
import crypto from "crypto";

// Possibilidades do slot machine
const emojis: string[] = [
	"🍒",
	"🍋",
	"🍊",
	"🍉",
	"🍇",
	"🍓",
	"🥝",
	"🍍",
	"🥭",
	"🍌",
	"🍎",
	"🍏",
	"🥥",
	"🍑",
	"🍐",
	"🍈",
	"🍆",
	"🥑",
	"🌽",
	"🥕",
];

/**
 * Função que escolhe 3 emojis aleatórios
 */
function spinSlotMachine(): string[] {
	const result: string[] = [];

	for (let i = 0; i < 3; i++) {
		const randomIndex = crypto.randomInt(0, emojis.length);
		result.push(emojis[randomIndex]);
	}

	return result;
}

/**
 * Função que everifica os slots e calcula resultado
 */
function checkSlots(slots: string[], bet: number): CalculateJackpotResponse {
	const unique = new Set(slots);

	switch (unique.size) {
		case 1:
			return {
				profit: bet * 2,
				result: "JACKPOT",
				slot0: slots[0],
				slot1: slots[1],
				slot2: slots[2],
			}; // JACKPOT -> Dobro da aposta
		case 2:
			return {
				profit: bet * 0.2,
				result: "2 OF A KIND",
				slot0: slots[0],
				slot1: slots[1],
				slot2: slots[2],
			}; // 2 IGUAIS -> 20% da aposta
		case 3:
			return {
				profit: 0,
				result: "BETTER LUCK NEXT TIME",
				slot0: slots[0],
				slot1: slots[1],
				slot2: slots[2],
			}; // NENHUM IGUAL -> Já era
		default:
			return {
				profit: 0,
				result: "BETTER LUCK NEXT TIME!",
				slot0: slots[0],
				slot1: slots[1],
				slot2: slots[2],
			};
	}
}

// Implementação do servidor
const slotMachineServer: SlotMachineServer = {
	randomPlay: (call, callback) => {
		const ip = call.getPeer();
		const timestamp = new Date().toISOString();

		console.log(
			`\n\x1b[32m[${timestamp}]\x1b[0m Requisição RandomPlay recebida de \x1b[36m${ip}\x1b[0m`
		);

		const result = spinSlotMachine();

		const response: RandomPlayResponse = {
			slot0: result[0],
			slot1: result[1],
			slot2: result[2],
		};
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

		const slots: string[] = [request.slot0, request.slot1, request.slot2];
		const bet: number = request.bet;

		const response: CalculateJackpotResponse = checkSlots(slots, bet);
		callback(null, response);
	},
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
