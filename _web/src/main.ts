import { CalculateJackpotResponse } from "../../_service/slotMachine";
import { ApiResponse } from "../../api-response";

const emojis: string[] = [
  "🍒","🍋","🍊","🍉","🍇","🍓","🥝","🍍","🥭","🍌",
  "🍎","🍏","🥥","🍑","🍐","🍈","🍆","🥑","🌽","🥕"
];

let spinInterval: number | null = null;

const lever = document.getElementById("lever")!;
const handle = document.getElementById("lever-handle")!;

handle.addEventListener("click", () => {
	lever.classList.add("pulled");
	handle.classList.add("pulled", "spining");

	// volta a posição original depois de 1s
	setTimeout(() => {
		lever.classList.remove("pulled");
		handle.classList.remove("pulled");
	}, 1000);

	spin().then((data) => {
		console.table(data);
		if(data.success){
			stopSpinAnimation([data.data.slot0,data.data.slot1,data.data.slot2]);
		}
	}).catch((reason) => console.error("Error: ", reason)).finally(() => handle.classList.remove("spining"))
});

async function spin() {
	const response = await fetch("http://localhost:3000/spin", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ bet: 20 }),
	});
	const data: ApiResponse<CalculateJackpotResponse> = await response.json();
	return data
}

// --- animação fake dos slots --- //
function startSpinAnimation() {
  if (spinInterval) clearInterval(spinInterval);

  spinInterval = window.setInterval(() => {
    slots.forEach((slot) => {
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      slot.textContent = randomEmoji;
    });
  }, 100); // troca a cada 100ms
}

function stopSpinAnimation(finalResult: string[]) {
  if (spinInterval) {
    clearInterval(spinInterval);
    spinInterval = null;
  }

  // mostra resultado final nos 3 slots
  slots.forEach((slot, i) => {
    slot.textContent = finalResult[i] ?? "❓";
  });
}