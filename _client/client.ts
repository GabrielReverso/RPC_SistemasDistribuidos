import { CalculatorClient } from "../_service/calculator";
import * as grpc from "@grpc/grpc-js";

function main() {
	const client = new CalculatorClient(
		"localhost:50051",
		// Sem TLS, inseguro, mas ok para teste
		grpc.credentials.createInsecure()
	);

	// Tipagem garante que só passamos números
	client.add({ a: 10, b: 32 }, (err, res) => {
		if (err) console.error(err);
		else console.log("Resultado da soma:", res?.result);
	});
}

main();
